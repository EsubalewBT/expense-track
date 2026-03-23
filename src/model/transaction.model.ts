import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import paginate from "./plugins/paginate.plugin";
import { IOptions, QueryResult } from "./plugins/paginate.types";
import toJSON from "./plugins/toJSON.plugin";

export const transactionCategories = [
    "Salary",
    "Investment",
    "Food",
    "Transport",
    "Housing",
    "Entertainment",
    "Health",
    "Other",
] as const;

const transactionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["INCOME", "EXPENSE"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: transactionCategories,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        fintrack: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fintrack",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

export type TransactionAttributes = InferSchemaType<typeof transactionSchema>;
export type TransactionDocument = HydratedDocument<TransactionAttributes>;
export interface TransactionModel extends mongoose.Model<TransactionAttributes> {
    paginate(
        filter: Record<string, unknown>,
        options?: IOptions
    ): Promise<QueryResult<TransactionDocument>>;
}

export const Transaction = mongoose.model<TransactionAttributes, TransactionModel>(
    "Transaction",
    transactionSchema
);