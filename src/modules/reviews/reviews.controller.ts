import { NextFunction, Request, Response } from "express";
import { reviewsService } from "./reviews.service";


const postReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { bookingId, rating, comment, tutorId } = req.body as {
            tutorId: string
            bookingId: string;
            rating: number;
            comment: string;
        };

        const review = await reviewsService.postReview({
            tutorId,
            bookingId,
            rating,
            comment,
            studentId: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: { review },
        });
    } catch (e) {
        next(e);
    }
}



export const reviewsController = {
    postReview,
}