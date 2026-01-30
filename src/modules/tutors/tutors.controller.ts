import { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutors.service";
import { UserRole } from "../../middleware/auth";


const addTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;

        if (!payload) {
            return res.status(400).json({
                success: false,
                message: "tutor data not found"
            })
        };

        const { id, data } = payload;

        const result = await tutorService.addTutor(data, id);

        res.status(201).json({
            success: true,
            message: 'tutor profile created. waiting for admin approval',
            result
        })

    }
    catch (e) {
        next(e)
    }
};

const updateTutorApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: applicationId } = req.params;
        const { status } = req.body;
        if (!applicationId) return res.status(400).json({
            success: false,
            message: 'application id is missing'
        });

        if (!status) {
            return res.status(400).json({ success: false, message: "status is missing" });
        }
        // console.log(status);
        const userId = req.user?.id;
        const role = req.user?.role;

        // console.log(userId,role)

        if (!userId || role !== UserRole.ADMIN) return res.status(401).json({
            success: false,
            message: 'unauthorized'
        })


        const result = await tutorService.updateTutorApplication(applicationId as string, status, userId);

        res.status(200).json({
            success: true,
            message: "tutor application updated",
            result
        })

    }
    catch (e) {
        // console.log(e);
        next(e);
    }
};

const getTutors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tutorService.getTutors(req.query);

        return res.status(200).json({
            success: true,
            message: "tutors fetched",
            tutors:result,
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

const getTutorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await tutorService.getTutorById(id as string);

        return res.status(200).json({
            success: true,
            message: "tutor fetched",
            tutor:result,
        });
    } catch (e) {
        next(e);
    }
};


export const tutorController = {
    addTutor,
    updateTutorApplication,
    getTutors,
    getTutorById,
}