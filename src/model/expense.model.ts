import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";

    export const expenseCategories = [
        "Food",
        "Transport",
        "Entertainment",
        "Health",
        "Other",
    ] as const;

    const expenseSchema = new Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
                private: true,
            },
            title: {
                type: String,
                required: true,
                trim: true,
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            category: {
                type: String,
                required: true,
                enum: expenseCategories,
                trim: true,
            },
            description: {
                type: String,
                trim: true,
            },
        },
        {
            timestamps: true,
        }
    );

    expenseSchema.plugin(toJSON);

    export type ExpenseAttributes = InferSchemaType<typeof expenseSchema>;
    export type CreateExpenseInput = Omit<ExpenseAttributes, "user">;
    export type UpdateExpenseInput = Partial<CreateExpenseInput>;
    export type ExpenseDocument = HydratedDocument<ExpenseAttributes>;
    export const Expense = mongoose.model<ExpenseAttributes>("Expense", expenseSchema);