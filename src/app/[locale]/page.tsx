import HeroSection from '@/components/sections/HeroSection'
import BookingWidget from '@/components/booking/BookingWidget'
import PopularRoutes from '@/components/sections/PopularRoutes'
import WhyBeninfy from '@/components/sections/WhyBeninfy'
import JourneyIntelligence from '@/components/sections/JourneyIntelligence'
import FleetPreview from '@/components/sections/FleetPreview'
import ToursPreview from '@/components/sections/ToursPreview'
import BorderInfoPreview from '@/components/sections/BorderInfoPreview'
import CTABanner from '@/components/sections/CTABanner'
import { setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <HeroSection />
      <BookingWidget />
      <PopularRoutes />
      <JourneyIntelligence />
      <WhyBeninfy />
      <FleetPreview />
      <ToursPreview />
      <BorderInfoPreview />
      <CTABanner />
    </>
  )
}
