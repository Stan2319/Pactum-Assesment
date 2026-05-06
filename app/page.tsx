import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { Hero } from "@/components/sections/Hero"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Problem } from "@/components/sections/Problem"
import { Pricing } from "@/components/sections/Pricing"
import { FinalCTA } from "@/components/sections/FinalCTA"
import { Footer } from "@/components/Footer"
import { AuthHashHandler } from "@/components/AuthHashHandler"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams

  // Supabase redirects invite/magic links to the Site URL (this page).
  // Forward any auth params to the dedicated callback route.
  const code = typeof params.code === "string" ? params.code : undefined
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : undefined
  const type = typeof params.type === "string" ? params.type : undefined

  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }
  if (tokenHash && type) {
    redirect(`/auth/callback?token_hash=${tokenHash}&type=${type}`)
  }

  return (
    <>
      {/* Handles tokens delivered as URL hash fragments (#access_token=...) */}
      <AuthHashHandler />
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
