import passport from "passport";
import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { UserDocument } from "../model/user.model";

// Extend Express Request user type for downstream handlers.
declare global {
	namespace Express {
		interface User extends UserDocument {}
	}
}

const verifyCallback =
	(req: Request, resolve: () => void, reject: (error: ApiError) => void) =>
	async (err: unknown, user: UserDocument | false, info: unknown) => {
		if (err || info || !user) {
			return reject(
				new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
			);
		}
		req.user = user;
		return resolve();
	};

export const auth = () => async (req: Request, res: Response, next: NextFunction) =>
	new Promise<void>((resolve, reject) => {
		passport.authenticate(
			"jwt",
			{ session: false },
			verifyCallback(req, resolve, reject)
		)(req, res, next);
	})
		.then(() => next())
		.catch((err) => next(err));
