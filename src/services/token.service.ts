import jwt, { JwtPayload } from "jsonwebtoken";
import dayjs, { Dayjs } from "dayjs";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { config } from "../config/config";
import { tokenTypes } from "../config/token";
import { Token, TokenAttributes } from "../model/token.model";
import * as userService from "./user.service";
import { ApiError } from "../utils/ApiError";

type TokenDocument = mongoose.HydratedDocument<TokenAttributes>;

export const generateToken = (
	userId: string | mongoose.Types.ObjectId,
	expires: Dayjs,
	type: string,
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
	userId: string | mongoose.Types.ObjectId,
	expires: Dayjs,
	type: string,
	blacklisted = false
): Promise<TokenDocument> => {
	const tokenDoc = await Token.create({
		token,
		user: userId,
		expires: expires.toDate(),
		type,
		blacklisted,
	});

	return tokenDoc;
};

export const verifyToken = async (
	token: string,
	type: string
): Promise<TokenDocument> => {
	const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
	const tokenDoc = await Token.findOne({
		token,
		type,
		user: payload.sub,
		blacklisted: false,
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
		const user = await userService.getUserById(
			refreshTokenDoc.user.toString()
		);

		if (!user) {
			throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
		}

		await refreshTokenDoc.deleteOne();
		return generateAuthTokens({ id: user._id.toString() });
	} catch (error) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
	}
};
