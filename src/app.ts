import * as dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";

import { tutorRouter } from "./modules/tutors/tutors.route";
import { categoriesRouter } from "./modules/categories/categories.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { authRouter } from "./modules/auth/auth.route";
import { adminRouter } from "./modules/admin/admin.route";
import { reviewsRouter } from "./modules/reviews/reviews.route";
import { dashboardRouter } from "./modules/dashboard/dashboard.route";

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


app.all("/api/auth/*any", toNodeHandler(auth));

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

app.use(errorHandler);
app.use(notFound);

export default app;
