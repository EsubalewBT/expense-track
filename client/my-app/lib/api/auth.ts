import {
	UseMutationOptions,
	UseMutationResult,
	useMutation,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from './axios';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ForgotPasswordResponse {
	message: string;
	previewUrl: string | null;
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
}

export interface AuthUser {
	id: string;
	name: string;
	email: string;
}

export interface TokenPayload {
	token: string;
	expires: string;
}

export interface AuthTokens {
	access: TokenPayload;
	refresh: TokenPayload;
}

export interface AuthResponse {
	user: AuthUser;
	tokens: AuthTokens;
}

export interface ApiErrorResponse {
	code?: number;
	message?: string;
}

export async function loginFn(credentials: LoginCredentials): Promise<AuthResponse> {
	const response = await api.post<AuthResponse>('/api/auth/login', credentials);
	return response.data;
}

export async function registerFn(payload: RegisterPayload): Promise<AuthResponse> {
	const response = await api.post<AuthResponse>('/api/auth/register', payload);
	return response.data;
}

export async function forgotPasswordFn(
	payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse | undefined> {
	const response = await api.post<ForgotPasswordResponse>(
		'/api/auth/forgot-password',
		payload
	);
	return response.data;
}

export async function resetPasswordFn(
	payload: ResetPasswordPayload
): Promise<void> {
	await api.post(
		`/api/auth/reset-password?token=${encodeURIComponent(payload.token)}`,
		{ password: payload.password }
	);
}

function persistAuthSession(data: AuthResponse) {
	if (typeof window === 'undefined') return;

	window.localStorage.setItem('accessToken', data.tokens.access.token);
	window.localStorage.setItem('refreshToken', data.tokens.refresh.token);
	window.localStorage.setItem('user', JSON.stringify(data.user));
}

type LoginMutationOptions = UseMutationOptions<
	AuthResponse,
	AxiosError<ApiErrorResponse>,
	LoginCredentials
>;

type RegisterMutationOptions = UseMutationOptions<
	AuthResponse,
	AxiosError<ApiErrorResponse>,
	RegisterPayload
>;

type ForgotPasswordMutationOptions = UseMutationOptions<
	ForgotPasswordResponse | undefined,
	AxiosError<ApiErrorResponse>,
	ForgotPasswordPayload
>;

type ResetPasswordMutationOptions = UseMutationOptions<
	void,
	AxiosError<ApiErrorResponse>,
	ResetPasswordPayload
>;

const AuthApi = {
	Login: {
		useMutation(
			options?: LoginMutationOptions
		): UseMutationResult<
			AuthResponse,
			AxiosError<ApiErrorResponse>,
			LoginCredentials
		> {
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['auth', 'login'],
				mutationFn: loginFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					persistAuthSession(data);
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	Register: {
		useMutation(
			options?: RegisterMutationOptions
		): UseMutationResult<
			AuthResponse,
			AxiosError<ApiErrorResponse>,
			RegisterPayload
		> {
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['auth', 'register'],
				mutationFn: registerFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					persistAuthSession(data);
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	ForgotPassword: {
		useMutation(
			options?: ForgotPasswordMutationOptions
		): UseMutationResult<
			ForgotPasswordResponse | undefined,
			AxiosError<ApiErrorResponse>,
			ForgotPasswordPayload
		> {
			return useMutation({
				mutationKey: ['auth', 'forgot-password'],
				mutationFn: forgotPasswordFn,
				...options,
			});
		},
	},
	ResetPassword: {
		useMutation(
			options?: ResetPasswordMutationOptions
		): UseMutationResult<void, AxiosError<ApiErrorResponse>, ResetPasswordPayload> {
			return useMutation({
				mutationKey: ['auth', 'reset-password'],
				mutationFn: resetPasswordFn,
				...options,
			});
		},
	},
};

export { AuthApi };

