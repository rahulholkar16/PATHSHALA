import { Router } from "express";
import { registerUser, loginUser, logoutUser, verifyEmail, refreshAccessToken, forgotPassword, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification } from "../controllers/auth.controller.js";
import { ValidationMiddleware, passwordValidator } from '../middlewares/validationMiddleware.js';
import { auth } from "../middlewares/authMiddleware.middlewares.js";

const router = Router();

router.route("/register").post(ValidationMiddleware, registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").post(passwordValidator, resetForgotPassword);

// protected route
router.route("/logout").post(auth, logoutUser);
router.route("/current-user").get(auth, getCurrentUser);
router.route("/changed-password").post(passwordValidator, auth, changeCurrentPassword);
router.route("/resend-email-verification").post(auth, resendEmailVerification);
export default router;