import express from "express";
import { tutorController } from "./tutors.controller";

const router = express.Router();

router.post("/",tutorController.addTutor);

export const tutorRouter = router;