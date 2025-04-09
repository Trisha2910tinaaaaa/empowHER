"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  
  // If auth is loaded and user is not signed in, redirect to sign in page
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Navbar />
      <main>
        {children}
      </main>
    </ThemeProvider>
  );
} 