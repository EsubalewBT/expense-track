import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import * as userService from "./user.service";
import * as tokenService from "./token.service";
import { tokenTypes } from "../config/token";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { SafeUser, UserAttributes } from "./user.service";

export const loginUserWithEmailAndPassword = async (
	email: string,
	password: string
): Promise<SafeUser> => {
	const user = await userService.getUserByEmail(email);
	if (!user || !(await bcrypt.compare(password, user.password))) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			"Incorrect email or password"
		);
	}

	return userService.toSafeUser(user);
};

export const registerUser = async (
	userBody: Partial<UserAttributes>
): Promise<SafeUser> => {
	const user = await userService.createUser(userBody);
	return user;
};

/**
 * Reset password
 */
export const resetPassword = async (
	resetPasswordToken: string,
	newPassword: string
): Promise<void> => {
	try {
		const resetPasswordTokenDoc = await tokenService.verifyToken(
			resetPasswordToken,
			tokenTypes.RESET_PASSWORD
		);

		const user = await userService.getUserById(resetPasswordTokenDoc.userId);

		if (!user) {
			throw new Error("User not found");
		}

		await userService.updateUserPasswordById(user.id, newPassword);

		await prisma.token.deleteMany({
			where: {
				userId: user.id,
			type: tokenTypes.RESET_PASSWORD,
			},
		});
	} catch (error) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
	}
};
