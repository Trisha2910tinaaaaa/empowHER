"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { User, Mail, Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";

export function AuthButton({ 
  variant = "default", 
  onAction
}: { 
  variant?: "default" | "mobile";
  onAction?: () => void;
}) {
  const { isSignedIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  if (isSignedIn) {
    return null;
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {variant === "default" ? (
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <User className="mr-2 h-4 w-4" /> {isSignUp ? "Join Now" : "Sign In"}
          </Button>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-4 py-6"
          >
            <User className="mr-2 h-5 w-5" /> {isSignUp ? "Join Now" : "Sign In"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Join empowHER" : "Welcome Back"}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {isSignUp 
              ? "Create your account to access all features"
              : "Sign in to access your personalized experience"}
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            {isSignUp ? (
              <SignUpButton mode="modal" afterSignUpUrl="/profile">
                <Button onClick={handleAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl">
                  <Mail className="mr-2 h-5 w-5" /> Continue with Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
            ) : (
              <SignInButton mode="modal" afterSignInUrl="/profile">
                <Button onClick={handleAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl">
                  <Mail className="mr-2 h-5 w-5" /> Continue with Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            )}
            
            <div className="flex items-center my-2">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-gray-500 font-medium">OR</span>
              <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {isSignUp ? (
                <SignUpButton mode="modal" strategy="oauth_github" afterSignUpUrl="/profile">
                  <Button onClick={handleAction} variant="outline" className="w-full hover:bg-gray-50 py-6 rounded-xl border-gray-200">
                    <Github className="mr-2 h-5 w-5" /> Continue with GitHub
                  </Button>
                </SignUpButton>
              ) : (
                <SignInButton mode="modal" strategy="oauth_github" afterSignInUrl="/profile">
                  <Button onClick={handleAction} variant="outline" className="w-full hover:bg-gray-50 py-6 rounded-xl border-gray-200">
                    <Github className="mr-2 h-5 w-5" /> Continue with GitHub
                  </Button>
                </SignInButton>
              )}
            </div>
            
            <div className="text-center text-sm mt-4">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to empowHER?{" "}
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-purple-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 