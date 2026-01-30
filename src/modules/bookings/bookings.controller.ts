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



export const bookingController = {
    createBooking,
}

