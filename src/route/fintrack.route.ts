import { Router } from 'express';

import { auth } from '../middleware/auth';
import validate from '../middleware/validate';
import * as fintrackController from '../controller/fintrack.controller';
import {
  createFintrackSchema,
  deleteFintrackSchema,
  getFintrackSchema,
  updateFintrackSchema,
} from '../validation/fintrack.validation';

const router = Router();
router.use(auth());

router.post('/', validate(createFintrackSchema), fintrackController.createFintrack);
router.get('/', fintrackController.getFintracks);
router.get('/:id', validate(getFintrackSchema), fintrackController.getFintrack);
router.get('/:id/stats', validate(getFintrackSchema), fintrackController.getVaultStats);
router.patch('/:id', validate(updateFintrackSchema), fintrackController.updateFintrack);
router.delete('/:id', validate(deleteFintrackSchema), fintrackController.deleteFintrack);

export const fintrackRouter = router;
