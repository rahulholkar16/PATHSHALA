import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from '../middlewares/validationMiddleware.js';
import { auth } from "../middlewares/authMiddleware.middlewares.js";

const router = Router();
router.route("/register").post(ValidationMiddleware, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(auth, logoutUser);
export default router;