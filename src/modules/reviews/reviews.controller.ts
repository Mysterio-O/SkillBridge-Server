import { NextFunction, Request, Response } from "express";
import { reviewsService } from "./reviews.service";
import { success } from "better-auth/*";


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


const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized"
        });

        const id = user.id;

        const result = await reviewsService.getReviews(id);

        res.status(200).json({
            success: true,
            message: "All reviews retrieved",
            data: result
        })

    }
    catch (e) {
        console.log(e);
        next(e);
    }
}



export const reviewsController = {
    postReview,
    getReviews,
}