"use client";

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorMonitor } from "./ErrorMonitor";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: any; 
};

export default function Providers({
  children,
  locale,
  messages,
}: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorMonitor />
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            theme="dark"
          />
        </NextIntlClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
} 