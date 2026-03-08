import { Router } from "express";
import validate from "../middleware/validate";
import {
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	refreshTokensSchema,
	registerSchema,
} from "../validation/auth.validation";
import * as authController from "../controller/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
	"/refresh-tokens",
	validate(refreshTokensSchema),
	authController.refreshToken
);
router.post(
	"/forgot-password",
	validate(forgotPasswordSchema),
	authController.forgotPassword
);
router.post(
	"/reset-password",
	validate(resetPasswordSchema),
	authController.resetPassword
);

export const authRouter = router;
