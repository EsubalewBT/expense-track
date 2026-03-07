import Joi from "joi";

const password = (value: string, helpers: Joi.CustomHelpers) => {
	if (value.length < 8) {
		return helpers.message({
			custom: "password must be at least 8 characters",
		});
	}
	if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
		return helpers.message({
			custom: "password must contain at least 1 letter and 1 number",
		});
	}

	return value;
};

export const registerSchema = {
	body: Joi.object().keys({
		email: Joi.string().required().email(),
		password: Joi.string().required().custom(password),
		name: Joi.string().required(),
	}),
};

export const loginSchema = {
	body: Joi.object().keys({
		email: Joi.string().required().email(),
		password: Joi.string().required(),
	}),
};

export const refreshTokensSchema = {
	body: Joi.object().keys({
		refreshToken: Joi.string().required(),
	}),
};
