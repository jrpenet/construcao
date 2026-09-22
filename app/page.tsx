import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { SocialProof } from '@/components/social-proof'
import { Features } from '@/components/features'
import { Benefits } from '@/components/benefits'
import { Testimonials } from '@/components/testimonials'
import { Differentials } from '@/components/differentials'
import { Pricing } from '@/components/pricing'
import { CtaSection } from '@/components/cta'
import { SiteFooter } from '@/components/site-footer'
import { WhatsappFloat } from '@/components/whatsapp-float'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <Benefits />
        <Testimonials />
        <Differentials />
        <Pricing />
        <CtaSection />
      </main>
      <SiteFooter />
      <WhatsappFloat />
    </>
  )
}
