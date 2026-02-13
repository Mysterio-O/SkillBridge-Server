export type AdminStats = {
    role: "admin";
    totals: {
        users: number;
        students: number;
        tutors: number;
        tutorApplicationsPending: number;
        tutorApplicationsActive: number;
        categories: number;
        bookingsTotal: number;
        reviewsTotal: number;
    };
    bookings: {
        pending: number;
        confirmed: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
    recent: {
        recentBookings: Array<{
            id: string;
            status: string; // or BookingStatus if you want
            startAt: Date;
            endAt: Date;
            currency: string;
            totalPrice: any; // Decimal
            student: { id: string; name: string; email: string };
            tutorProfile: {
                id: string;
                user: { id: string; name: string; email: string };
            };
        }>;
        pendingTutorApplications: Array<{
            id: string;
            createdAt: Date;
            user: { id: string; name: string; email: string; image: string | null };
        }>;
    };
};


export type TutorStats = {
    role: "tutor";
    profile: {
        exists: boolean;
        status?: string;
        availability?: string;
        isActive?: boolean;
        isProfileComplete?: boolean;
        avgRating?: any;
        reviewCount?: number;
        hourlyRate?: any;
        currency?: string;
    };
    bookings: {
        total: number;
        pending: number;
        confirmed: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        upcomingCount: number;
    };
    reviews: {
        total: number;
        visible: number;
        hidden: number;
        avgRating: number;
        latest: Array<{
            id: string;
            rating: number;
            comment: string | null;
            isHidden: boolean;
            createdAt: Date;
            student: { id: string; name: string; email: string };
            booking: { id: string; completedAt: Date | null; durationMinutes: number };
        }>;
    };
    recentBookings: Array<{
        id: string;
        status: string;
        startAt: Date;
        endAt: Date;
        student: { id: string; name: string; email: string; image: string | null };
        durationMinutes: number;
        currency: string;
        totalPrice: any;
    }>;
};

export type StudentStats = {
    role: "student";
    bookings: {
        total: number;
        pending: number;
        confirmed: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        upcomingCount: number;
    };
    reviews: {
        total: number;
        avgRatingGiven: number;
        latest: Array<{
            id: string;
            rating: number;
            comment: string | null;
            createdAt: Date;
            tutor: { id: string; name: string; email: string };
            booking: { id: string; completedAt: Date | null; durationMinutes: number };
        }>;
    };
    recentBookings: Array<{
        id: string;
        status: string;
        startAt: Date;
        endAt: Date;
        durationMinutes: number;
        currency: string;
        totalPrice: any;
        tutorProfile: {
            id: string;
            user: { id: string; name: string; email: string; image: string | null };
        };
    }>;
};

export type DashboardStats = AdminStats | TutorStats | StudentStats;