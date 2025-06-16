"use client";

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

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
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
} 