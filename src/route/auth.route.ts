import { Router } from "express";
import validate from "../middleware/validate";
import {
	loginSchema,
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

export const authRouter = router;
