import path from 'path';
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

import { config } from './config';

const swaggerDefinition: Options['definition'] = {
	openapi: '3.0.3',
	info: {
		title: 'Expense Tracker API',
		version: '1.0.0',
		description: 'A robust, multi-tenant expense tracking API',
		license: {
			name: 'MIT',
			url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
		},
	},
	servers: [
		{
			url: `http://localhost:${config.port}`,
			description: 'Local Server',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
	},
	security: [
		{
			bearerAuth: [],
		},
	],
};

const options: Options = {
	definition: swaggerDefinition,
	apis: [
		path.join(process.cwd(), 'src/route/*.ts'),
		path.join(process.cwd(), 'src/docs/**/*.yml'),
		path.join(process.cwd(), 'dist/route/*.js'),
		path.join(process.cwd(), 'dist/docs/**/*.yml'),
	],
};

export const swaggerSpec = swaggerJSDoc(options);
