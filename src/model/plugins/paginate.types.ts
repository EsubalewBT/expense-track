import type { Model } from 'mongoose';

export interface QueryResult<T = unknown> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface PaginateOptions {
	sortBy?: string;
	projectBy?: string;
	limit?: number | string;
	page?: number | string;
}

export type PaginateModel<T> = Model<T> & {
	paginate(filter: Record<string, unknown>, options?: PaginateOptions): Promise<QueryResult<T>>;
};


export type IOptions = PaginateOptions;
