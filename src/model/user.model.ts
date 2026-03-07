import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import toJSON from "./plugins/toJSON.plugin";
export interface UserAttributes {
	name: string;
	email: string;
	password: string;
}

export type UserMethods = {
	isPasswordMatch(password: string): Promise<boolean>;
};

export type UserDocument = mongoose.HydratedDocument<UserAttributes, UserMethods>;

export interface UserModel extends Model<UserAttributes, {}, UserMethods> {
	isEmailTaken(
		email: string,
		excludeUserId?: mongoose.Types.ObjectId
	): Promise<boolean>;
}

const userSchema = new Schema<UserAttributes, UserModel, UserMethods>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 8,
            private: true,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.plugin(toJSON);

userSchema.statics.isEmailTaken = async function (
	email: string,
	excludeUserId?: mongoose.Types.ObjectId
) {
	const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
	return Boolean(user);
};

userSchema.methods.isPasswordMatch = async function (password: string) {
	return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 8);
	}
});

export const User = mongoose.model<UserAttributes, UserModel>("User", userSchema);
