import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { User } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";

export interface UserAttributes {
	name: string;
	email: string;
	password: string;
}

export type UserDocument = User;
export type SafeUser = Omit<User, "password">;

export const toSafeUser = (user: User): SafeUser => {
	const { password: _password, ...safeUser } = user;
	return safeUser;
};

export const isEmailTaken = async (email: string, excludeUserId?: string): Promise<boolean> => {
	const existingUser = await prisma.user.findFirst({
		where: {
			email,
			...(excludeUserId ? { id: { not: excludeUserId } } : {}),
		},
	});

	return Boolean(existingUser);
};

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, 8);
};

export const createUser = async (
	userBody: Partial<UserAttributes>
): Promise<SafeUser> => {
	if (!userBody.name || !userBody.email || !userBody.password) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Name, email and password are required");
	}

	const normalizedEmail = userBody.email.trim().toLowerCase();

	if (await isEmailTaken(normalizedEmail)) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
	}

	const hashedPassword = await hashPassword(userBody.password);
	const user = await prisma.user.create({
		data: {
			name: userBody.name.trim(),
			email: normalizedEmail,
			password: hashedPassword,
		},
	});

	return toSafeUser(user);
};

export const getUserByEmail = async (
	email: string
): Promise<UserDocument | null> => {
	return prisma.user.findUnique({
		where: { email: email.trim().toLowerCase() },
	});
};

export const getUserById = async (
	id: string
): Promise<UserDocument | null> => {
	return prisma.user.findUnique({ where: { id } });
};

export const updateUserPasswordById = async (
	id: string,
	newPassword: string
): Promise<void> => {
	await prisma.user.update({
		where: { id },
		data: {
			password: await hashPassword(newPassword),
		},
	});
};
