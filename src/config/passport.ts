import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from "passport-jwt";
import { config } from "../config/config";
import { tokenTypes } from "../config/token";
import { prisma } from "../lib/prisma";

const jwtOptions = {
	secretOrKey: config.jwt.secret,
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload, done) => {
	try {
		if (!payload || typeof payload !== "object") {
			return done(null, false);
		}

		if (payload.type !== tokenTypes.ACCESS) {
			return done(null, false);
		}

		if (!payload.sub) {
			return done(null, false);
		}

		const subject = typeof payload.sub === "string" ? payload.sub : undefined;
		if (!subject) {
			return done(null, false);
		}

		const user = await prisma.user.findUnique({
			where: { id: subject },
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		if (!user) {
			return done(null, false);
		}

		return done(null, user);
	} catch (error) {
		return done(error, false);
	}
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
