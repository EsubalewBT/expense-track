import mongoose, { Schema, Document } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";

export interface IFintrack extends Document {
	title: string;
	description?: string;
	icon: "wallet" | "briefcase" | "zap" | "home" | "piggy-bank" | "trending-up";
	color: string;
	user: mongoose.Types.ObjectId;
}

const fintrackSchema = new Schema<IFintrack>(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		icon: {
			type: String,
			enum: ["wallet", "briefcase", "zap", "home", "piggy-bank", "trending-up"],
			default: "wallet",
		},
		color: { type: String, default: "teal" },
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true }
);

fintrackSchema.plugin(toJSON);

export const Fintrack = mongoose.model<IFintrack>("Fintrack", fintrackSchema);
