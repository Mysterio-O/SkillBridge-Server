import { UserRole } from "../../middleware/auth";
import { getAdminStats, getStudentStats, getTutorStats } from "./dashboard.actions";
import { DashboardStats } from "./dashboard.types";


const getDashboardStats = async (userId: string, role: UserRole): Promise<DashboardStats> => {
    if (role === UserRole.ADMIN) return getAdminStats();
    if (role === UserRole.TUTOR) return getTutorStats(userId);
    return getStudentStats(userId);
};

export const dashboardService = {
    getDashboardStats,
}