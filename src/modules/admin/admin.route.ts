import express from "express";
import { adminController } from "./admin.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), adminController.getUsers);

router.patch("/:id",auth(UserRole.ADMIN),adminController.updateUser);

export const adminRouter = router;