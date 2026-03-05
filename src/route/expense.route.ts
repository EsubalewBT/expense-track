import { Router } from "express";
import * as expenseController from "../controller/expense.controller";

const router = Router();

router.post("/", expenseController.createExpense);
router.get("/", expenseController.getExpenses);

router.get("/:id", expenseController.getExpense);
router.patch("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

export const expenseRouter = router;
