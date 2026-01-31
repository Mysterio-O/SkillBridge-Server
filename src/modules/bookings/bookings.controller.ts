import { NextFunction, Request, Response } from "express";
import { bookingService } from "./booking.service";


const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        if (!payload) return res.status(400).json({
            success: false,
            message: 'booking data not found!',
        });

        const { studentId, data } = payload;

        if (!studentId) return res.status(400).json({
            success: false,
            message: "student id missing"
        })

        const result = await bookingService.createBooking(studentId, data);

        res.status(201).json({
            success: false,
            message: "booking created successfully!",
            booking: result
        })

    }
    catch (e) {
        console.log(e);
        next(e);
    }
};

const getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized"
        });

        const userId = user.id;

        const result = await bookingService.getBookings(userId);

        res.status(200).json({
            success: true,
            message: result.length > 0 ? "All Bookings Retrieved!" : "No bookings created yet",
            bookings: result
        })
    }
    catch (e) {
        next(e);
    }
};

const getBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        console.log(bookingId);
        if (!bookingId) return res.status(400).json({
            success: false,
            message: "booking id not found"
        });

        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized access"
        })

        const result = await bookingService.getBooking(bookingId as string);

        if (result.studentId !== user.id) return res.status(401).json({
            success: false,
            message: "unauthorized access"
        })

        res.status(200).json({
            success: true,
            message: "booking retrieved successfully",
            booking: result
        })

    }
    catch (e) {
        next(e);
    }
}



export const bookingController = {
    createBooking,
    getBookings,
    getBooking,
}

