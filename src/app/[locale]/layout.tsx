import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import LocaleLayoutShell from '@/components/layout/LocaleLayoutShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beninfy | Premium West African Travel',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <LocaleLayoutShell>{children}</LocaleLayoutShell>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

