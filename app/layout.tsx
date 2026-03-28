import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Memories Into Perfumes (MIP) - Perfume Discovery & Creation",
  description: "Discover similar perfumes, build your own formulas, and master fragrance ingredients with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-screen flex flex-col bg-perfume-dark text-white overflow-x-hidden font-inter">
        <Navigation />
        <main className="flex-1 animate-fade-in">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
