import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import QueryProvider from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ExpenseFlow',
    template: '%s | ExpenseFlow',
  },
  description: 'Modern expense tracking for focused personal and team finance management.',
  applicationName: 'ExpenseFlow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
