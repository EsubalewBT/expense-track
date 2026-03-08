import { Model, Schema } from 'mongoose';

import { IOptions, QueryResult } from './paginate.types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT = 'createdAt';

const toPositiveInt = (value: unknown, fallback: number): number => {
	const parsed = Number.parseInt(String(value), 10);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return parsed;
};

const buildSort = (sortBy?: string): string => {
	if (!sortBy) {
		return DEFAULT_SORT;
	}

	const parts = sortBy
		.split(',')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => {
			const [field, order] = segment.split(':').map((token) => token.trim());
			if (!field) {
				return '';
			}

			return `${order === 'desc' ? '-' : ''}${field}`;
		})
		.filter(Boolean);

	return parts.length > 0 ? parts.join(' ') : DEFAULT_SORT;
};

const buildProjection = (projectBy?: string): string | undefined => {
	if (!projectBy) {
		return undefined;
	}

	const parts = projectBy
		.split(',')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => {
			const [field, action] = segment.split(':').map((token) => token.trim());
			if (!field) {
				return '';
			}

			return `${action === 'hide' ? '-' : ''}${field}`;
		})
		.filter(Boolean);

	return parts.length > 0 ? parts.join(' ') : undefined;
};

const paginate = (schema: Schema) => {
	(schema.statics as { paginate?: unknown }).paginate = async function (
		filter: Record<string, unknown>,
		options: IOptions = {},
	): Promise<QueryResult> {
		const model = this as Model<unknown>;
		const sort = buildSort(options.sortBy);
		const limit = Math.min(toPositiveInt(options.limit, DEFAULT_LIMIT), MAX_LIMIT);
		const page = toPositiveInt(options.page, DEFAULT_PAGE);
		const skip = (page - 1) * limit;
		const projection = buildProjection(options.projectBy);

		const countPromise = model.countDocuments(filter).exec();
		let docsQuery = model.find(filter).sort(sort).skip(skip).limit(limit);

		if (projection) {
			docsQuery = docsQuery.select(projection);
		}

		const [totalResults, results] = await Promise.all([countPromise, docsQuery.exec()]);

		return {
			results,
			page,
			limit,
			totalPages: Math.ceil(totalResults / limit),
			totalResults,
		};
	};
};

export default paginate;
