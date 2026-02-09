import { NextFunction, Request, Response } from "express";
import { bookingService } from "./booking.service";
import { BookingStatus } from "../../../generated/prisma/enums";
import { CancelPayload } from "./booking.types";


const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        if (!payload) return res.status(400).json({
            success: false,
            message: 'booking data not found!',
        });

        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized"
        });

        const studentId = user.id

        const data = payload;

        if (!studentId) return res.status(400).json({
            success: false,
            message: "student id missing"
        })

        const result = await bookingService.createBooking(studentId, data);

        res.status(201).json({
            success: true,
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
        const role = user.role

        const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
        const page_size = Math.min(
            Math.max(parseInt(String(req.query.page_size ?? "10"), 10) || 10, 1),
            100
        );

        const searchRaw = String(req.query.search ?? "").trim();
        const search = searchRaw.length > 0 ? searchRaw : undefined;

        const result = await bookingService.getBookings(userId, { page, page_size, search, role });

        res.status(200).json({
            success: true,
            message: result.bookings.length > 0 ? "All Bookings Retrieved!" : "No bookings created yet",
            data: result
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


const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status: BookingStatus = req.body.status;
        const cancelReason = req.body?.cancelReason;

        const { id } = req.params;

        if (!id) return res.status(400).json({
            success: false,
            message: "Booking id not found"
        })

        if (!status) return res.status(400).json({
            success: false,
            message: "status missing"
        });

        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: 'unauthorized'
        });

        const cancelPayload =
            status === "cancelled" ? {
                cancelledBy: user.id,
                cancelReason: cancelReason || null,
            }
                : undefined;

        const result = await bookingService.updateBookingStatus(id as string, status, cancelPayload);

        res.status(200).json({
            success: true,
            message: `Booking status updated to: ${status}`,
            data: result
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
    updateBookingStatus,
}

