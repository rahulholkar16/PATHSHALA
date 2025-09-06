import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from '../middlewares/validationMiddleware.js';

const router = Router();
router.route("/register").post(ValidationMiddleware, registerUser);
router.route("/login").post(loginUser);
export default router;