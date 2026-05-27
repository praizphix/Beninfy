import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import AuthProvider from '@/components/shared/AuthProvider'
import LocaleLayoutShell from '@/components/layout/LocaleLayoutShell'
import LenisProvider from '@/components/shared/LenisProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beninfy | Premium West African Travel',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LenisProvider />
          <LocaleLayoutShell>{children}</LocaleLayoutShell>
        </ThemeProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}

