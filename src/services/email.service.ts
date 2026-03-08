import nodemailer from 'nodemailer';
import { config } from '../config/config';

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
	transport
		.verify()
		.then(() => {
			console.info('Connected to email server');
		})
		.catch((error: unknown) => {
			console.warn('Unable to connect to email server. Check SMTP configuration.', error);
		});
}

/**
 * Sends an email using the configured SMTP transport.
 */
export const sendEmail = async (
	to: string,
	subject: string,
	text: string,
	html?: string,
): Promise<void> => {
	if (config.env === 'test') {
		return;
	}

	await transport.sendMail({
		from: config.email.from,
		to,
		subject,
		text,
		html,
	});
};

/**
 * Sends a reset-password email with a tokenized reset URL.
 */
export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
	const subject = 'Reset password';
	const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}`;
	const text = [
		'Dear user,',
		`To reset your password, click on this link: ${resetPasswordUrl}`,
		'If you did not request a password reset, you can ignore this email.',
	].join('\n');

	await sendEmail(to, subject, text);
};

/**
 * Sends an email-verification message with a tokenized verification URL.
 */
export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
	const subject = 'Email verification';
	const verificationEmailUrl = `http://localhost:3000/verify-email?token=${token}`;
	const text = [
		'Dear user,',
		`To verify your email, click on this link: ${verificationEmailUrl}`,
		'If you did not create an account, you can ignore this email.',
	].join('\n');

	await sendEmail(to, subject, text);
};

