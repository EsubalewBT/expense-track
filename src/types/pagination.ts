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
	fintrackId?: string;
}

export type IOptions = PaginateOptions;
