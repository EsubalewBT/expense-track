import { Request, Response } from 'express';
import httpStatus from 'http-status';

import * as fintrackService from '../services/fintrack.service';
import { ApiError } from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';

const getRequestId = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Please authenticate');
  }

  return req.user._id.toString();
};

export const createFintrack = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const fintrack = await fintrackService.createFintrack(req.body, getAuthenticatedUserId(req));
  res.status(httpStatus.CREATED).json(fintrack);
});

export const getFintracks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const fintracks = await fintrackService.getFintracks(getAuthenticatedUserId(req));
  res.status(httpStatus.OK).json(fintracks);
});

export const getFintrack = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const fintrack = await fintrackService.getFintrackById(getRequestId(req), getAuthenticatedUserId(req));

  if (!fintrack) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Fintrack not found');
  }

  res.status(httpStatus.OK).json(fintrack);
});

export const updateFintrack = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const fintrack = await fintrackService.updateFintrackById(
    getRequestId(req),
    getAuthenticatedUserId(req),
    req.body,
  );

  if (!fintrack) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Fintrack not found');
  }

  res.status(httpStatus.OK).json(fintrack);
});

export const deleteFintrack = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const fintrack = await fintrackService.deleteFintrackById(getRequestId(req), getAuthenticatedUserId(req));

  if (!fintrack) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Fintrack not found');
  }

  res.status(httpStatus.OK).json({
    message: 'Fintrack deleted successfully',
    fintrack,
  });
});
