import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BTX – Bin Tuwaym Excellence | Food Safety Competency Assessment",
  description:
    "Measuring Excellence in Food Safety Competency. Professional competency assessment platform for the global food industry.",
  keywords: ["food safety", "competency assessment", "BTX", "certification", "HACCP"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
