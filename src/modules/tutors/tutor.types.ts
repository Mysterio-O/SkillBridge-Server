import { MeetingPlatform, TutorAvailability, TutorSessionMode } from "../../../generated/prisma/enums";


export type CreateTutorProfileInput = {
    headline?: string | null;
    about?: string | null;

    hourlyRate: string | number;
    currency: string;

    yearsOfExperience?: number | null;
    languages: string[];

    education?: string | null;
    certification?: string | null;

    sessionMode: TutorSessionMode;
    meetingPlatform: MeetingPlatform;
    timezone?: string | null;

    availability: TutorAvailability;

    subjectCategoryIds?: string[];
};
