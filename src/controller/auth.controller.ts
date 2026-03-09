import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { config } from "../config/config";
import * as authService from "../services/auth.ervice";
import * as tokenService from "../services/token.service";
import * as emailService from "../services/email.service";

export const register = catchAsync(async (req: Request, res: Response) => {
	const user = await authService.registerUser(req.body);
	const verifyEmailToken = await tokenService.generateVerifyEmailToken({
		id: user._id.toString(),
	});

	try {
		await emailService.sendVerificationEmail(user.email, verifyEmailToken);
	} catch (error: unknown) {
		console.warn("Failed to send verification email", error);
	}

	const tokens = await tokenService.generateAuthTokens({
		id: user._id.toString(),
	});

	res.status(httpStatus.CREATED).json({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const user = await authService.loginUserWithEmailAndPassword(
		email,
		password
	);
	const tokens = await tokenService.generateAuthTokens({
		id: user._id.toString(),
	});

	res.status(httpStatus.OK).json({ user, tokens });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const tokens = await tokenService.refreshAuthTokens(req.body.refreshToken);
	res.status(httpStatus.OK).json({ ...tokens });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	let previewUrl: string | null = null;

	try {
		const resetPasswordToken = await tokenService.generateResetPasswordToken(
			req.body.email
		);
		const emailDispatch = await emailService.sendResetPasswordEmail(
			req.body.email,
			resetPasswordToken
		);
		previewUrl = emailDispatch.previewUrl;
	} catch (error: unknown) {
		// Prevents user-enumeration by always returning 204.
		console.warn("Forgot-password email dispatch skipped", error);
	}

	if (config.env === "development") {
		res.status(httpStatus.OK).json({
			message:
				"If an account exists for this email, reset instructions were prepared.",
			previewUrl,
		});
		return;
	}

	res.status(httpStatus.NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
	await authService.resetPassword(req.query.token as string, req.body.password);
	res.status(httpStatus.NO_CONTENT).send();
});
