import Joi from 'joi';

const iconValues = ['wallet', 'briefcase', 'zap', 'home', 'piggy-bank', 'trending-up'] as const;

export const createFintrackSchema = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    description: Joi.string().allow(''),
    icon: Joi.string()
      .valid(...iconValues)
      .optional(),
    color: Joi.string().optional(),
  }),
};

export const updateFintrackSchema = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      description: Joi.string().allow(''),
      icon: Joi.string().valid(...iconValues),
      color: Joi.string(),
    })
    .min(1),
};

export const getFintrackSchema = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
};

export const deleteFintrackSchema = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
};
