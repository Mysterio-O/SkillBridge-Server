import { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutors.service";


const addTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        
        if (!payload) {
            return res.status(400).json({
                success: false,
                message: "tutor data not found"
            })
        };
        
        const {id,data} = payload;

        const result = await tutorService.addTutor(data,id);

        res.status(201).json({
            success:true,
            message:'tutor profile created. waiting for admin approval',
            result
        })

    }
    catch (e) {
        next(e)
    }
};


export const tutorController = {
    addTutor
}