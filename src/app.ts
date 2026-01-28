import * as dotenv from 'dotenv';
dotenv.config()
import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node"
import { auth } from './lib/auth';
import cors from 'cors'

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


export default app;