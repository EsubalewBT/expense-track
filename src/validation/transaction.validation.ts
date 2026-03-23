import Joi from 'joi';
import { transactionCategories } from '../model/transaction.model';

export const createTransactionSchema = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    amount: Joi.number().required().min(0),
    type: Joi.string().required().valid('INCOME', 'EXPENSE'),
    category: Joi.string().required().valid(...transactionCategories),
    description: Joi.string().allow(''),
    date: Joi.date().optional(),
  }),
};

export const updateTransactionSchema = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      amount: Joi.number().min(0),
      type: Joi.string().valid('INCOME', 'EXPENSE'),
      category: Joi.string().valid(...transactionCategories),
      description: Joi.string().allow(''),
      date: Joi.date(),
    })
    .min(1),
};
