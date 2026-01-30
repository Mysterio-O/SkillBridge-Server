import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

    let statusCode = 500;
    let errMessage = "Internal server error";
    let errDetails = err;

    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errMessage = "You provided incorrect field."
    }

    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            statusCode = 400;
            errMessage = "An operation failed because it depends on one or more records that were required but not provided"
        } else if (err.code === 'P2002') {
            statusCode = 400;
            errMessage = "duplicate key provided"
        }
    }
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errMessage = "Something went wrong during query execution. Please try again"
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = 401;
            errMessage = 'Authentication failed. Please check your username and password'
        }
        else if (err.errorCode === "P1001") {
            statusCode = 500;
            errMessage = "Cannot reach the database server "
        }
    }
    /**
     * 
     *  there are more error types are there. check the official docs and     *  implements them as per need
     * 
     */


    res.status(statusCode);
    res.json({
        success: false,
        message: errMessage,
        details: errDetails
    })
};

export default errorHandler;