import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import * as authService from "../services/auth.ervice";
import * as tokenService from "../services/token.service";

export const register = catchAsync(async (req: Request, res: Response) => {
	const user = await authService.registerUser(req.body);
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
