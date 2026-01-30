import express from "express";
import { tutorController } from "./tutors.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.post("/", tutorController.addTutor);

router.patch("/:id/update",auth(UserRole.ADMIN), tutorController.updateTutorApplication);

export const tutorRouter = router;