import jwt, { JwtPayload } from "jsonwebtoken";
import dayjs, { Dayjs } from "dayjs";
import httpStatus from "http-status";
import { Token, TokenType } from "@prisma/client";

import { config } from "../config/config";
import { tokenTypes } from "../config/token";
import { prisma } from "../lib/prisma";
import * as userService from "./user.service";
import { ApiError } from "../utils/ApiError";

type TokenDocument = Token;
type TokenTypeValue = (typeof tokenTypes)[keyof typeof tokenTypes];

const toTokenType = (type: TokenTypeValue): TokenType => type as TokenType;

export const generateToken = (
	userId: string,
	expires: Dayjs,
	type: TokenTypeValue,
	secret = config.jwt.secret
): string => {
	const payload = {
		sub: userId,
		iat: dayjs().unix(),
		exp: expires.unix(),
		type,
	};

	return jwt.sign(payload, secret);
};

export const saveToken = async (
	token: string,
	userId: string,
	expires: Dayjs,
	type: TokenTypeValue,
	blacklisted = false
): Promise<TokenDocument> => {
	const tokenDoc = await prisma.token.create({
		data: {
			token,
			userId,
			expires: expires.toDate(),
			type: toTokenType(type),
			blacklisted,
		},
	});

	return tokenDoc;
};

export const verifyToken = async (
	token: string,
	type: TokenTypeValue
): Promise<TokenDocument> => {
	const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
	const subject = typeof payload.sub === "string" ? payload.sub : undefined;

	if (!subject) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload");
	}

	const tokenDoc = await prisma.token.findFirst({
		where: {
			token,
			type: toTokenType(type),
			userId: subject,
			blacklisted: false,
		},
	});

	if (!tokenDoc) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Token not found");
	}

	return tokenDoc;
};

export const generateAuthTokens = async (user: { id: string }) => {
	const accessTokenExpires = dayjs().add(
		config.jwt.accessExpirationMinutes,
		"minutes"
	);
	const accessToken = generateToken(
		user.id,
		accessTokenExpires,
		tokenTypes.ACCESS
	);

	const refreshTokenExpires = dayjs().add(
		config.jwt.refreshExpirationDays,
		"days"
	);
	const refreshToken = generateToken(
		user.id,
		refreshTokenExpires,
		tokenTypes.REFRESH
	);

	await saveToken(
		refreshToken,
		user.id,
		refreshTokenExpires,
		tokenTypes.REFRESH
	);

	return {
		access: {
			token: accessToken,
			expires: accessTokenExpires.toDate(),
		},
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires.toDate(),
		},
	};
};

export const refreshAuthTokens = async (refreshToken: string) => {
	try {
		const refreshTokenDoc = await verifyToken(
			refreshToken,
			tokenTypes.REFRESH
		);
		const user = await userService.getUserById(refreshTokenDoc.userId);

		if (!user) {
			throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
		}

		await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
		return generateAuthTokens({ id: user.id });
	} catch (error) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
	}
};

export const generateVerifyEmailToken = async (
	user: { id: string }
): Promise<string> => {
	const verifyEmailTokenExpires = dayjs().add(1, "day");
	const verifyEmailToken = generateToken(
		user.id,
		verifyEmailTokenExpires,
		tokenTypes.VERIFY_EMAIL
	);

	await saveToken(
		verifyEmailToken,
		user.id,
		verifyEmailTokenExpires,
		tokenTypes.VERIFY_EMAIL
	);

	return verifyEmailToken;
};

/**
 * Generate reset password token
 */
export const generateResetPasswordToken = async (
	email: string
): Promise<string> => {
	const user = await userService.getUserByEmail(email);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
	}

	const userId = user.id;

	const expires = dayjs().add(config.jwt.refreshExpirationDays, "minutes");
	const resetPasswordToken = generateToken(
		userId,
		expires,
		tokenTypes.RESET_PASSWORD
	);

	await saveToken(resetPasswordToken, userId, expires, tokenTypes.RESET_PASSWORD);

	return resetPasswordToken;
};
