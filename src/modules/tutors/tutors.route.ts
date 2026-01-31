import express from "express";
import { tutorController } from "./tutors.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/", tutorController.getTutors);

router.get("/:id", tutorController.getTutorById)

router.post("/", tutorController.addTutor);

router.put("/profile", auth(UserRole.TUTOR), tutorController.updateTutorProfile);

router.patch("/:id/update", auth(UserRole.ADMIN), tutorController.updateTutorApplication);


export const tutorRouter = router;