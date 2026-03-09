import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import paginate from "./plugins/paginate.plugin";
import { IOptions, QueryResult } from "./plugins/paginate.types";
import toJSON from "./plugins/toJSON.plugin";

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
                trim: true,
                minlength: 1,
                maxlength: 50,
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
    expenseSchema.plugin(paginate);

    export type ExpenseAttributes = InferSchemaType<typeof expenseSchema>;
    export type CreateExpenseInput = Omit<ExpenseAttributes, "user">;
    export type UpdateExpenseInput = Partial<CreateExpenseInput>;
    export type ExpenseDocument = HydratedDocument<ExpenseAttributes>;
    export interface ExpenseModel extends mongoose.Model<ExpenseAttributes> {
        paginate(
            filter: Record<string, unknown>,
            options?: IOptions
        ): Promise<QueryResult<ExpenseDocument>>;
    }

    export const Expense = mongoose.model<ExpenseAttributes, ExpenseModel>("Expense", expenseSchema);