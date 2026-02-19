import express from "express";
import auth, { UserRole } from "../../middleware/auth";
import { userController } from "./users.controller";

const router = express.Router();


router.patch("/profile", auth(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), userController.updateProfile);


export const userRouter = router;