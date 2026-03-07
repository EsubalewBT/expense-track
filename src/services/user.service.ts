import { User, UserAttributes, UserDocument } from "../model/user.model";
import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

export const createUser = async (
	userBody: Partial<UserAttributes>
): Promise<UserDocument> => {
	if (userBody.email && (await User.isEmailTaken(userBody.email))) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
	}

	return User.create(userBody);
};

export const getUserByEmail = async (
	email: string
): Promise<UserDocument | null> => {
	return User.findOne({ email });
};

export const getUserById = async (
	id: string
): Promise<UserDocument | null> => {
	return User.findById(id);
};
