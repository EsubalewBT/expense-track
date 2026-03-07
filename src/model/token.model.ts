import mongoose, { Schema } from "mongoose";
import { tokenTypes } from "../config/token";

export interface TokenAttributes {
	token: string;
	user: mongoose.Types.ObjectId;
	type: string;
	expires: Date;
	blacklisted: boolean;
}

const tokenSchema = new Schema<TokenAttributes>(
	{
		token: {
			type: String,
			required: true,
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: [
				tokenTypes.ACCESS,
				tokenTypes.REFRESH,
				tokenTypes.RESET_PASSWORD,
				tokenTypes.VERIFY_EMAIL,
			],
			required: true,
		},
		expires: {
			type: Date,
			required: true,
		},
		blacklisted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

tokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model<TokenAttributes>("Token", tokenSchema);
