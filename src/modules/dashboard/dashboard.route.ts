import express from 'express';
import auth, { UserRole } from '../../middleware/auth';
import { dashboardController } from './dashboard.controller';


const router = express.Router();


router.get("/", auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR), dashboardController.getDashboardStats);

export const dashboardRouter = router;