import { Hero } from '@/components/landing/hero'
import { PainPoints } from '@/components/landing/pain-points'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}