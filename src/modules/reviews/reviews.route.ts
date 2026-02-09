import express from 'express';
import { reviewsController } from './reviews.controller';
import auth, { UserRole } from '../../middleware/auth';

const router = express.Router();

router.post("/", auth(UserRole.STUDENT, UserRole.ADMIN), reviewsController.postReview);

export const reviewsRouter = router;