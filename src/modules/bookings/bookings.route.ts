import express from "express";
import { bookingController } from "./bookings.controller";
import auth, { UserRole } from "../../middleware/auth";


const router = express.Router();


router.get("/", auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR), bookingController.getBookings);

router.get("/:id", auth(UserRole.ADMIN, UserRole.STUDENT), bookingController.getBooking);

router.post("/", auth(UserRole.STUDENT, UserRole.ADMIN), bookingController.createBooking);

router.patch("/:id", auth(UserRole.STUDENT, UserRole.TUTOR), bookingController.updateBookingStatus);

export const bookingRouter = router;