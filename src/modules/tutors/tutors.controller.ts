import { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutors.service";
import { UserRole } from "../../middleware/auth";
import { success } from "better-auth/*";


const addTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;

        if (!payload?.id || !payload?.data) {
            return res.status(400).json({
                success: false,
                message: "Invalid payload. Expected { id, data }",
            });
        }

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

        // console.log(applicationId)

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
        console.log(e);
        next(e);
    }
};

const getTutors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tutorService.getTutors(req.query);

        return res.status(200).json({
            success: true,
            message: "tutors fetched",
            data: {
                meta: result.meta,
                tutors: result.data
            },
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
            tutor: result,
        });
    } catch (e) {
        next(e);
    }
};


const updateTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const data = req.body;

        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized access"
        });

        const userId = user.id;

        const result = await tutorService.updateTutorProfile(data, userId);

        res.status(200).json({
            success: true,
            message: "updated tutor profile",
            tutor: result
        })

    }
    catch (e) {
        console.log(e)
        next(e);
    }
};

const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const status = req.body.status;

        if (!user || !user.id) return res.status(401).json({
            success: false,
            message: "unauthorized"
        });
        console.log(req.body)

        if (status !== 'available' && status !== 'not_available') return res.status(400).json({
            success: false,
            message: "Status not allowed. Use 'available' or 'not_available'."
        });

        const result = await tutorService.updateAvailability(status, user.id);

        res.status(200).json({
            success: true,
            message: `availability updated to ${status}`,
            profile: result
        })

    }
    catch (e) {
        console.log(e)
        next(e);
    }
};

const getPendingApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const result = await tutorService.getPendingApplications(req.query);

        return res.status(200).json({
            success: true,
            message: "pending applications fetched",
            ...result,
        });
    } catch (e) {
        next(e);
    }
};

const getTutorProfileOwn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({
            success: false,
            message: "unauthorized"
        });

        const result = await tutorService.getTutorProfileOwn(user.id);

        res.status(200).json({
            success: true,
            message: "Retrieved tutor profile",
            data: result
        })

    }
    catch (e) {
        console.log(e)
        next(e)
    }
}

export const tutorController = {
    addTutor,
    updateTutorApplication,
    getTutors,
    getTutorById,
    updateTutorProfile,
    updateAvailability,
    getPendingApplications,
    getTutorProfileOwn,
}