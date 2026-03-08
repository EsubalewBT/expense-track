import { Router } from "express";
import * as expenseController from "../controller/expense.controller";
import validate from "../middleware/validate";
import {
	createExpenseSchema,
	deleteExpenseSchema,
	getExpenseIdSchema,
	getExpensesSchema,
	updateExpenseSchema,
} from "../validation/expense.validation";
import { auth } from "../middleware/auth";
const router = Router();
router.use(auth());

router.post("/", validate(createExpenseSchema), expenseController.createExpense);
router.get("/", validate(getExpensesSchema), expenseController.getExpenses);
router.get("/stats", expenseController.getStats);

router.get("/:id", validate(getExpenseIdSchema), expenseController.getExpense);
router.patch("/:id", validate(updateExpenseSchema), expenseController.updateExpense);
router.delete("/:id", validate(deleteExpenseSchema), expenseController.deleteExpense);

export const expenseRouter = router;
