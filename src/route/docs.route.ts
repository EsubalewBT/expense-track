import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from '../config/swagger';

const router = Router();

router.get('/docs.json', (_req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});

router.use('/', swaggerUi.serve);
router.get(
	'/',
	swaggerUi.setup(swaggerSpec, {
		explorer: true,
	}),
);

export const docsRouter = router;
