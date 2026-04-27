import { Nav } from "@/components/Nav"
import { Hero } from "@/components/sections/Hero"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Problem } from "@/components/sections/Problem"
import { Pricing } from "@/components/sections/Pricing"
import { FinalCTA } from "@/components/sections/FinalCTA"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Problem />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
