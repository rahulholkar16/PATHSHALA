import { Router } from "express";
import { createCourse, updateCourse, deleteCourse, getAllCourse, getCourse, addSection, addLecture, updateSection, updateLecture, deleteLecture, deleteSection } from "../controllers/course.controller.js";
import { ValidationMiddleware, passwordValidator } from '../middlewares/validationMiddleware.js';
import { auth } from "../middlewares/authMiddleware.middlewares.js";
import { allowPermission } from "../middlewares/permissionMiddleware.middleware.js";

const router = Router();

router.post("/createCourse", auth, createCourse);
router.put("/updateCourse", auth, updateCourse);
router.delete("/deleteCourse", deleteCourse);
router.get("/getallCourse", auth, getAllCourse);

router.post("/createLecture", auth, addLecture);
router.post("/createSection/:courseId", auth, addSection);
export default router;