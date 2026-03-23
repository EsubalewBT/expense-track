/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the expense
 *         title:
 *           type: string
 *           description: Title of the expense
 *         amount:
 *           type: number
 *           description: Cost of the item
 *         category:
 *           type: string
 *           description: Category label chosen by the user
 *         date:
 *           type: string
 *           format: date
 *         user:
 *           type: string
 *           description: ID of the owner
 *       example:
 *         id: d5fE_asz
 *         title: Lunch
 *         amount: 25.50
 *         category: Food
 *         date: 2023-10-25T10:00:00.000Z
 */

import { Router } from "express";
import * as expenseController from "../controller/transaction.controller";
import validate from "../middleware/validate";
import {
	createTransactionSchema,
	updateTransactionSchema,
} from "../validation/transaction.validation";
import { auth } from "../middleware/auth";
const router = Router();
router.use(auth());

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               title: Gym Membership
 *               amount: 50
 *               category: Health
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Expense'
 *       "401":
 *         description: Unauthorized
 *       "400":
 *         description: Bad Request (Validation failed)
 */
router.post("/", validate(createTransactionSchema), expenseController.createExpense);
router.get("/", expenseController.getExpenses);

/**
 * @swagger
 * /expenses/stats:
 *   get:
 *     summary: Get expense totals by category
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *                   count:
 *                     type: number
 */
router.get("/stats", expenseController.getStats);

router.get("/:id", expenseController.getExpense);
router.patch("/:id", validate(updateTransactionSchema), expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

export const expenseRouter = router;
