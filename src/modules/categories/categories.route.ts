import Express from "express"
import { categoriesController } from "./categories.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Express.Router();


router.get("/", categoriesController.getCategories);

router.post("/", auth(UserRole.ADMIN, UserRole.TUTOR), categoriesController.createCategory);


export const categoriesRouter = router;