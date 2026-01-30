import { Request, Response } from "express";

export function notFound (req:Request,res:Response){
    const path = req.path;
    console.log(path)
    // console.log(req)
    res.status(404).json({
        success:false,
        message: `your requested path: "${path}" is not available`
    })
}