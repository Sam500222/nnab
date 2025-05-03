import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Serif_Display, Space_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "No Nothing Ass Bitch",
  description: "Fake it 'til you make it… or fuck off.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSerif.variable} ${spaceMono.variable} font-sans bg-champagne text-onyx min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
