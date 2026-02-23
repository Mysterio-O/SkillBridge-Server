import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";



function prismaSafeDetails(err: any) {
    return {
        name: err?.name,
        code: err?.code ?? err?.errorCode,
        message: err?.message,
        meta: err?.meta,
    };
}

function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Always log the full error to server logs so production issues are visible
    // (Vercel / serverless platforms expose stdout/stderr to the function logs)
    console.error(err);
    // If response already started, delegate to default handler
    if (res.headersSent) return next(err);

    let statusCode = 500;
    let errMessage = "Internal server error";

    // show more details in dev, less in prod
    const isDev = process.env.NODE_ENV !== "production";
    const errDetails = isDev ? prismaSafeDetails(err) : undefined;

    // Map common application-level Error messages to HTTP statuses
    if (err?.message && typeof err.message === "string") {
        const m = err.message;
        if (m.includes("User already exists")) {
            statusCode = 409;
            errMessage = "User already exists.";
            return res.status(statusCode).json({ success: false, message: errMessage });
        }
        if (m.includes("Invalid credentials")) {
            statusCode = 401;
            errMessage = "Invalid credentials.";
            return res.status(statusCode).json({ success: false, message: errMessage });
        }
        if (m.includes("JWT secret not configured")) {
            statusCode = 500;
            errMessage = "Server authentication is not configured.";
            return res.status(statusCode).json({ success: false, message: errMessage });
        }
    }

    // Prisma validation (bad query shape)
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errMessage = "You provided incorrect field(s).";
    }

    // Prisma known request errors (DB constraints, not found, etc.)
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2025":
                statusCode = 404;
                errMessage =
                    "Record not found. The operation depends on a record that does not exist.";
                break;

            case "P2002":
                statusCode = 409;
                errMessage = "Duplicate key. This value already exists.";
                break;

            case "P2003": // ✅ YOUR FOREIGN KEY ERROR
                statusCode = 400;
                errMessage =
                    "Foreign key constraint failed. You referenced an ID that doesn't exist.";
                break;

            case "P2011":
                statusCode = 400;
                errMessage = "Null constraint failed. A required field is missing.";
                break;

            case "P2000":
                statusCode = 400;
                errMessage = "Value too long for a column.";
                break;

            default:
                statusCode = 400;
                errMessage = "Database request failed.";
                break;
        }
    }

    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errMessage = "Something went wrong during query execution. Please try again.";
    }

    else if (err instanceof Prisma.PrismaClientInitializationError) {
        switch (err.errorCode) {
            case "P1000":
                statusCode = 401;
                errMessage = "Authentication failed. Please check DB credentials.";
                break;
            case "P1001":
                statusCode = 500;
                errMessage = "Cannot reach the database server.";
                break;
            default:
                statusCode = 500;
                errMessage = "Database initialization failed.";
                break;
        }
    }

    return res.status(statusCode).json({
        success: false,
        message: errMessage,
        ...(isDev ? { details: errDetails } : {}),
    });
}


export default errorHandler;