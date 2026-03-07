import httpStatus from "http-status";
import * as userService from "./user.service";
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
