import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const BASE_URL = "https://pactum.so";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Pactum: AI Hiring Assessments That Actually Work",
  description:
    "Stop testing memorization. Pactum lets candidates use AI on real work tasks, then shows you every prompt, every decision, and an automatic score.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Pactum: AI Hiring Assessments That Actually Work",
    description:
      "Stop testing memorization. Pactum lets candidates use AI on real work tasks, then shows you every prompt, every decision, and an automatic score.",
    type: "website",
    url: BASE_URL,
    siteName: "Pactum",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pactum — AI Hiring Assessments That Actually Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pactum: AI Hiring Assessments That Actually Work",
    description:
      "Stop testing memorization. Pactum lets candidates use AI on real work tasks, then shows you every prompt, every decision, and an automatic score.",
    images: ["/og-image.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pactum",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@pactum.so",
    contactType: "customer support",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pactum",
  url: BASE_URL,
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pactum",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered hiring assessment platform that tests real work skills. Candidates complete job tasks using AI tools while Pactum records every prompt, decision, and scores the session automatically.",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "99",
        priceCurrency: "USD",
        unitText: "month",
      },
    },
    {
      "@type": "Offer",
      name: "Professional",
      price: "549",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "549",
        priceCurrency: "USD",
        unitText: "month",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(window.location.pathname!=='/'&&localStorage.getItem('pactum-dark')==='true')document.documentElement.setAttribute('data-dark','true')}catch(e){}` }} />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
