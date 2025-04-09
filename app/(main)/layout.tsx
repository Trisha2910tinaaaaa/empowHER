"use client";

import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Navbar />
      <main>
        {children}
      </main>
    </ThemeProvider>
  );
} 