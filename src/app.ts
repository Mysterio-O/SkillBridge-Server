import * as dotenv from 'dotenv';
dotenv.config()
import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node"
import { auth } from './lib/auth';
import cors from 'cors'
import errorHandler from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import { tutorRouter } from './modules/tutors/tutors.route';

const app: Application = express();
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json());





app.get("/", async (req, res) => {
    // console.log("Hello World")
    res.send("Hello World")
});


app.use("/api/tutor",tutorRouter);


app.use(errorHandler);

app.use(notFound);



export default app;