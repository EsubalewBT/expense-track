import axios, {
	AxiosError,
	AxiosHeaders,
	AxiosRequestConfig,
	InternalAxiosRequestConfig,
} from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/';

function getBaseUrl() {
	const rawUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
	return rawUrl.replace(/\/$/, '');
}

const isBrowser = typeof window !== 'undefined';

function getAccessToken() {
	if (!isBrowser) return null;
	return window.localStorage.getItem('accessToken');
}

function getRefreshToken() {
	if (!isBrowser) return null;
	return window.localStorage.getItem('refreshToken');
}

function setAccessToken(token: string) {
	if (!isBrowser) return;
	window.localStorage.setItem('accessToken', token);
}

function setRefreshToken(token: string) {
	if (!isBrowser) return;
	window.localStorage.setItem('refreshToken', token);
}

function clearAuthStorage() {
	if (!isBrowser) return;
	window.localStorage.removeItem('accessToken');
	window.localStorage.removeItem('refreshToken');
	window.localStorage.removeItem('user');
}

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
	const headers = AxiosHeaders.from(config.headers);
	headers.set('Authorization', `Bearer ${token}`);
	config.headers = headers;
}

// Shared API client for all frontend requests.
export const api = axios.create({
	baseURL: getBaseUrl(),
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 15000,
});

type RefreshTokensResponse = {
	access: {
		token: string;
		expires: string;
	};
	refresh: {
		token: string;
		expires: string;
	};
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) {
		return null;
	}

	if (!refreshPromise) {
		const refreshUrl = `${getBaseUrl()}/auth/refresh-tokens`;
		refreshPromise = axios
			.post<RefreshTokensResponse>(
				refreshUrl,
				{ refreshToken },
				{
					headers: { 'Content-Type': 'application/json' },
					timeout: 15000,
				}
			)
			.then((response) => {
				const nextAccessToken = response.data?.access?.token;
				const nextRefreshToken = response.data?.refresh?.token;

				if (!nextAccessToken || !nextRefreshToken) {
					return null;
				}

				setAccessToken(nextAccessToken);
				setRefreshToken(nextRefreshToken);
				return nextAccessToken;
			})
			.catch(() => null)
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

api.interceptors.request.use(
	(config) => {
		const token = getAccessToken();
		if (token) {
			setAuthorizationHeader(config, token);
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (!isBrowser || error.response?.status !== 401) {
			return Promise.reject(error);
		}

		const originalRequest = error.config as RetriableRequestConfig | undefined;
		const requestUrl = originalRequest?.url || '';
		const isRefreshRequest = requestUrl.includes('/auth/refresh-tokens');

		if (!originalRequest || originalRequest._retry || isRefreshRequest) {
			clearAuthStorage();
			window.location.replace('/auth/sign-in');
			return Promise.reject(error);
		}

		originalRequest._retry = true;
		const nextAccessToken = await refreshAccessToken();

		if (!nextAccessToken) {
			clearAuthStorage();
			window.location.replace('/auth/sign-in');
			return Promise.reject(error);
		}

		const retryConfig: AxiosRequestConfig = {
			...originalRequest,
			headers: {
				...originalRequest.headers,
				Authorization: `Bearer ${nextAccessToken}`,
			},
		};

		return api.request(retryConfig);
	}
);

