import { BookingStatus, TutorProfileStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AdminStats, StudentStats, TutorStats } from "./dashboard.types";


function clampRating(n: number) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(5, n));
}


export async function getAdminStats(): Promise<AdminStats> {
    const [
        users,
        students,
        tutors,
        tutorApplicationsPending,
        tutorApplicationsActive,
        categories,
        reviewsTotal,
        bookingsTotal,
        bookingCountsByStatus,
        recentBookings,
        pendingTutorApplications,
    ] = await prisma.$transaction(async (tx) => {
        const users = await tx.user.count();

        const students = await tx.user.count({ where: { role: "student" } });
        const tutors = await tx.user.count({ where: { role: "tutor" } });

        const tutorApplicationsPending = await tx.tutorProfile.count({
            where: { status: TutorProfileStatus.pending },
        });

        const tutorApplicationsActive = await tx.tutorProfile.count({
            where: { status: TutorProfileStatus.active },
        });

        const categories = await tx.categories.count();
        const reviewsTotal = await tx.review.count();
        const bookingsTotal = await tx.booking.count();

        // groupBy booking status
        const grouped = await tx.booking.groupBy({
            by: ["status"],
            _count: { status: true },
        });

        const recentBookings = await tx.booking.findMany({
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                status: true,
                startAt: true,
                endAt: true,
                currency: true,
                totalPrice: true,
                student: { select: { id: true, name: true, email: true } },
                tutorProfile: {
                    select: {
                        id: true,
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        const pendingTutorApplications = await tx.tutorProfile.findMany({
            where: { status: TutorProfileStatus.pending },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                id: true,
                createdAt: true,
                user: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        return [
            users,
            students,
            tutors,
            tutorApplicationsPending,
            tutorApplicationsActive,
            categories,
            reviewsTotal,
            bookingsTotal,
            grouped,
            recentBookings,
            pendingTutorApplications,
        ] as const;
    });

    const map: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
    };

    for (const row of bookingCountsByStatus) {
        map[row.status] = row._count.status;
    }

    return {
        role: "admin",
        totals: {
            users,
            students,
            tutors,
            tutorApplicationsPending,
            tutorApplicationsActive,
            categories,
            bookingsTotal,
            reviewsTotal,
        },
        bookings: {
            pending: map.pending as number,
            confirmed: map.confirmed as number,
            in_progress: map.in_progress as number,
            completed: map.completed as number,
            cancelled: map.cancelled as number,
        },
        recent: {
            recentBookings,
            pendingTutorApplications,
        },
    };
}




export async function getTutorStats(userId: string): Promise<TutorStats> {
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: {
            id: true,
            status: true,
            availability: true,
            isActive: true,
            isProfileComplete: true,
            avgRating: true,
            reviewCount: true,
            hourlyRate: true,
            currency: true,
        },
    });

    // If tutor profile doesn't exist yet, return safe defaults
    if (!tutorProfile) {
        return {
            role: "tutor",
            profile: { exists: false },
            bookings: {
                total: 0,
                pending: 0,
                confirmed: 0,
                in_progress: 0,
                completed: 0,
                cancelled: 0,
                upcomingCount: 0,
            },
            reviews: { total: 0, visible: 0, hidden: 0, avgRating: 0, latest: [] },
            recentBookings: [],
        };
    }

    const tutorProfileId = tutorProfile.id;
    const now = new Date();

    const [
        bookingsTotal,
        bookingGrouped,
        upcomingCount,
        reviewsTotal,
        reviewsVisible,
        reviewsHidden,
        avgRatingAgg,
        latestReviews,
        recentBookings,
    ] = await prisma.$transaction(async (tx) => {
        const bookingsTotal = await tx.booking.count({
            where: { tutorProfileId },
        });

        const bookingGrouped = await tx.booking.groupBy({
            by: ["status"],
            where: { tutorProfileId },
            _count: { status: true },
        });

        const upcomingCount = await tx.booking.count({
            where: {
                tutorProfileId,
                startAt: { gt: now },
                status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
            },
        });

        const reviewsTotal = await tx.review.count({
            where: { tutorId: userId },
        });

        const reviewsVisible = await tx.review.count({
            where: { tutorId: userId, isHidden: false },
        });

        const reviewsHidden = await tx.review.count({
            where: { tutorId: userId, isHidden: true },
        });

        const avgRatingAgg = await tx.review.aggregate({
            where: { tutorId: userId, isHidden: false },
            _avg: { rating: true },
        });

        const latestReviews = await tx.review.findMany({
            where: { tutorId: userId },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                id: true,
                rating: true,
                comment: true,
                isHidden: true,
                createdAt: true,
                student: { select: { id: true, name: true, email: true } },
                booking: { select: { id: true, completedAt: true, durationMinutes: true } },
            },
        });

        const recentBookings = await tx.booking.findMany({
            where: { tutorProfileId },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                status: true,
                startAt: true,
                endAt: true,
                durationMinutes: true,
                currency: true,
                totalPrice: true,
                student: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        return [
            bookingsTotal,
            bookingGrouped,
            upcomingCount,
            reviewsTotal,
            reviewsVisible,
            reviewsHidden,
            avgRatingAgg,
            latestReviews,
            recentBookings,
        ] as const;
    });

    const map: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
    };

    for (const row of bookingGrouped) {
        map[row.status] = row._count.status;
    }

    const avgRating =
        avgRatingAgg._avg.rating == null ? 0 : clampRating(Number(avgRatingAgg._avg.rating));

    return {
        role: "tutor",
        profile: {
            exists: true,
            status: tutorProfile.status,
            availability: tutorProfile.availability,
            isActive: tutorProfile.isActive,
            isProfileComplete: tutorProfile.isProfileComplete,
            avgRating: tutorProfile.avgRating,
            reviewCount: tutorProfile.reviewCount,
            hourlyRate: tutorProfile.hourlyRate,
            currency: tutorProfile.currency,
        },
        bookings: {
            total: bookingsTotal,
            pending: map.pending as number,
            confirmed: map.confirmed as number,
            in_progress: map.in_progress as number,
            completed: map.completed as number,
            cancelled: map.cancelled as number,
            upcomingCount,
        },
        reviews: {
            total: reviewsTotal,
            visible: reviewsVisible,
            hidden: reviewsHidden,
            avgRating,
            latest: latestReviews,
        },
        recentBookings,
    };
}


export async function getStudentStats(userId: string): Promise<StudentStats> {
    const now = new Date();

    const [
        bookingsTotal,
        bookingGrouped,
        upcomingCount,
        reviewsTotal,
        avgRatingAgg,
        latestReviews,
        recentBookings,
    ] = await prisma.$transaction(async (tx) => {
        const bookingsTotal = await tx.booking.count({
            where: { studentId: userId },
        });

        const bookingGrouped = await tx.booking.groupBy({
            by: ["status"],
            where: { studentId: userId },
            _count: { status: true },
        });

        const upcomingCount = await tx.booking.count({
            where: {
                studentId: userId,
                startAt: { gt: now },
                status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
            },
        });

        const reviewsTotal = await tx.review.count({
            where: { studentId: userId },
        });

        const avgRatingAgg = await tx.review.aggregate({
            where: { studentId: userId },
            _avg: { rating: true },
        });

        const latestReviews = await tx.review.findMany({
            where: { studentId: userId },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                tutor: { select: { id: true, name: true, email: true } },
                booking: { select: { id: true, completedAt: true, durationMinutes: true } },
            },
        });

        const recentBookings = await tx.booking.findMany({
            where: { studentId: userId },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                status: true,
                startAt: true,
                endAt: true,
                durationMinutes: true,
                currency: true,
                totalPrice: true,
                tutorProfile: {
                    select: {
                        id: true,
                        user: { select: { id: true, name: true, email: true, image: true } },
                    },
                },
            },
        });

        return [
            bookingsTotal,
            bookingGrouped,
            upcomingCount,
            reviewsTotal,
            avgRatingAgg,
            latestReviews,
            recentBookings,
        ] as const;
    });

    const map: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
    };

    for (const row of bookingGrouped) {
        map[row.status] = row._count.status;
    }

    const avgRatingGiven =
        avgRatingAgg._avg.rating == null ? 0 : clampRating(Number(avgRatingAgg._avg.rating));

    return {
        role: "student",
        bookings: {
            total: bookingsTotal,
            pending: map.pending as number,
            confirmed: map.confirmed as number,
            in_progress: map.in_progress as number,
            completed: map.completed as number,
            cancelled: map.cancelled as number,
            upcomingCount,
        },
        reviews: {
            total: reviewsTotal,
            avgRatingGiven,
            latest: latestReviews,
        },
        recentBookings,
    };
}