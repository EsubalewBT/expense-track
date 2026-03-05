    import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

    export const expenseCategories = [
        "Food",
        "Transport",
        "Entertainment",
        "Health",
        "Other",
    ] as const;

    const expenseSchema = new Schema(
        {
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

    export type ExpenseAttributes = InferSchemaType<typeof expenseSchema>;
    export type ExpenseDocument = HydratedDocument<ExpenseAttributes>;
    export const Expense = mongoose.model<ExpenseAttributes>("Expense", expenseSchema);