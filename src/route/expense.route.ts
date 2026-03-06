import { Router } from "express";
import * as expenseController from "../controller/expense.controller";
import validate from "../middleware/validate";
import { createExpenseSchema, getExpenseIdSchema, updateExpenseSchema, deleteExpenseSchema } from "../validation/expense.validation";
const router = Router();

router.post("/", validate(createExpenseSchema), expenseController.createExpense);
router.get("/", validate(getExpenseIdSchema), expenseController.getExpenses);

router.get("/:id", validate(getExpenseIdSchema), expenseController.getExpense);
router.patch("/:id", validate(updateExpenseSchema), expenseController.updateExpense);
router.delete("/:id", validate(deleteExpenseSchema), expenseController.deleteExpense);

export const expenseRouter = router;
