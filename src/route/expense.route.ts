import { Router } from "express";
import * as expenseController from "../controller/expense.controller";
import validate from "../middleware/validate";
import { createExpenseSchema, getExpenseIdSchema, updateExpenseSchema, deleteExpenseSchema } from "../validation/expense.validation";
import { auth } from "../middleware/auth";
const router = Router();
router.use(auth());

router.post("/", validate(createExpenseSchema), expenseController.createExpense);
router.get("/",  expenseController.getExpenses);

router.get("/:id", expenseController.getExpense);
router.patch("/:id", validate(updateExpenseSchema), expenseController.updateExpense);
router.delete("/:id", validate(deleteExpenseSchema), expenseController.deleteExpense);

export const expenseRouter = router;
