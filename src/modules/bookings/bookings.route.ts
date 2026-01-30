import express from "express";
import { bookingController } from "./bookings.controller";
import auth, { UserRole } from "../../middleware/auth";


const router = express.Router();


router.post("/", auth(UserRole.STUDENT), bookingController.createBooking);

export const bookingRouter = router;