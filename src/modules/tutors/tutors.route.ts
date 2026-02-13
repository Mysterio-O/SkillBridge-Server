import express from "express";
import { tutorController } from "./tutors.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/", tutorController.getTutors);


router.get('/applications/pending', auth(UserRole.ADMIN), tutorController.getPendingApplications);

router.post("/", tutorController.addTutor);

router.get("/profile", auth(UserRole.TUTOR), tutorController.getTutorProfileOwn);

router.put("/profile", auth(UserRole.TUTOR), tutorController.updateTutorProfile);

router.put("/availability", auth(UserRole.TUTOR), tutorController.updateAvailability);

router.get("/:id", tutorController.getTutorById);
router.patch("/:id/update", auth(UserRole.ADMIN), tutorController.updateTutorApplication);


export const tutorRouter = router;