import express from "express";
import auth, { UserRole } from "../../middleware/auth";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verify);
router.get("/me", auth(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), authController.getCurrentUser);

export const authRouter = router;