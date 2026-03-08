import httpStatus from "http-status";
import * as userService from "./user.service";
import * as tokenService from "./token.service";
import { tokenTypes } from "../config/token";
import { Token } from "../model/token.model";
import { ApiError } from "../utils/ApiError";
import { UserAttributes, UserDocument } from "../model/user.model";

export const loginUserWithEmailAndPassword = async (
	email: string,
	password: string
): Promise<UserDocument> => {
	const user = await userService.getUserByEmail(email);
	if (!user || !(await user.isPasswordMatch(password))) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			"Incorrect email or password"
		);
	}

	return user;
};

export const registerUser = async (
	userBody: Partial<UserAttributes>
): Promise<UserDocument> => {
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

		const user = await userService.getUserById(
			resetPasswordTokenDoc.user.toString()
		);

		if (!user) {
			throw new Error("User not found");
		}

		// Password hashing is handled by the user model pre-save hook.
		user.password = newPassword;
		await user.save();

		await Token.deleteMany({
			user: user._id,
			type: tokenTypes.RESET_PASSWORD,
		});
	} catch (error) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
	}
};
