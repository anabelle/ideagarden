import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Idea Garden 🌱 | Nurture Your Ideas",
  description: "Plant your ideas as seeds, water them with new thoughts, and harvest them when they're ready. An organic approach to idea management.",
  keywords: ["ideas", "productivity", "notes", "brainstorming", "creativity", "gamification"],
  authors: [{ name: "Idea Garden" }],
  openGraph: {
    title: "Idea Garden 🌱",
    description: "Nurture your ideas from seeds to harvest",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
