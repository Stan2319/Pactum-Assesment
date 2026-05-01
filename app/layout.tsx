import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pactum: AI Hiring Assessments That Actually Work",
  description:
    "Stop testing memorization. Pactum lets candidates use AI on real work tasks, then shows you every prompt, every decision, and an automatic score.",
  openGraph: {
    title: "Pactum: AI Hiring Assessments That Actually Work",
    description:
      "Stop testing memorization. Pactum lets candidates use AI on real work tasks, then shows you every prompt, every decision, and an automatic score.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
