import { Prisma } from "../../../generated/prisma/client";
import { httpError } from "../../helpers/helper";
import { prisma } from "../../lib/prisma";


type PostReviewInput = {
    tutorId: string;
    bookingId?: string;
    rating?: number;
    comment?: string;
    studentId: string;
};

const postReview = async ({ bookingId, rating, comment, studentId, tutorId }: PostReviewInput) => {
    if (!bookingId) throw httpError(400, "bookingId is required");
    if (typeof rating !== "number") throw httpError(400, "rating is required");
    if (rating < 1 || rating > 5) throw httpError(400, "rating must be between 1 and 5");
    if (comment != null && typeof comment !== "string") throw httpError(400, "comment must be a string");


    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            studentId: true,
            tutorProfileId: true,
            status: true,
        },
    });

    if (!booking) throw httpError(404, "Booking not found");


    if (booking.studentId !== studentId) {
        throw httpError(403, "You can only review your own booking");
    }


    if (booking.status && booking.status !== "completed") {
        throw httpError(400, "You can only review a completed booking");
    }

    try {
        const review = await prisma.review.create({
            data: {
                bookingId: booking.id,
                studentId,
                tutorId,
                rating,
                comment: comment?.trim() || null,
            },
        });

        return review;
    } catch (e: any) {
        console.log(e);
        // Unique bookingId -> only one review per booking
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                throw httpError(409, "A review for this booking already exists");
            }
        }
        throw e;
    }
};


export const reviewsService = {
    postReview,
}