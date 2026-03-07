import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from "passport-jwt";
import { config } from "../config/config";
import { tokenTypes } from "../config/token";
import { User } from "../model/user.model";

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

		const user = await User.findById(payload.sub);
		if (!user) {
			return done(null, false);
		}

		return done(null, user);
	} catch (error) {
		return done(error, false);
	}
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
