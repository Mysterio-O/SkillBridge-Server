import * as dotenv from "dotenv";
dotenv.config();

// Log presence of JWT secret at startup (do not print secret value)
console.log("JWT secret present:", Boolean(process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET));

import express, { Application } from "express";
import cors from "cors";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";

import { tutorRouter } from "./modules/tutors/tutors.route";
import { categoriesRouter } from "./modules/categories/categories.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { authRouter } from "./modules/auth/auth.route";
import { adminRouter } from "./modules/admin/admin.route";
import { reviewsRouter } from "./modules/reviews/reviews.route";
import { dashboardRouter } from "./modules/dashboard/dashboard.route";
import { userRouter } from "./modules/users/users.route";

const app: Application = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://skill-bridge-client.netlify.app"
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.use("/api/admin/users", adminRouter);
app.use("/api/authentication", authRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/bookings", bookingRouter);
app.use('/api/review', reviewsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);
app.use(notFound);

export default app;
