"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TbLoaderQuarter } from "react-icons/tb";
import { FcGoogle } from "react-icons/fc";
import { BsGithub } from "react-icons/bs";
import Image from "next/image";

interface SignInButtonProps {
  showCard?: boolean;
  compact?: boolean;
  redirectTo?: string;
  className?: string;
}

const providers = [
  { id: "google", label: "Google", icon: FcGoogle, color: "text-blue-600" },
  { id: "github", label: "GitHub", icon: BsGithub, color: "" },
] as const;

const SignInButton: React.FC<SignInButtonProps> = ({
  showCard = true,
  compact = false,
  redirectTo = "/dashboard",
  className = "",
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl: redirectTo });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const buttons = (
    <div
      className={`flex ${
        compact ? "gap-2" : "flex-col gap-8 w-full"
      } ${className}`}
    >
      {providers.map(({ id, label, icon: Icon, color }) => (
        <Button
          key={id}
          onClick={() => handleSignIn(id)}
          variant="outline"
          size={compact ? "sm" : "lg"}
          disabled={!!loadingProvider}
          className={`relative ${
            compact ? "gap-2" : "h-12"
          } bg-background hover:bg-accent border-input transition-colors`}
          aria-label={`Continue with ${label}`}
        >
          {loadingProvider === id ? (
            <TbLoaderQuarter
              className={`${compact ? "w-4 h-4" : "w-5 h-5"} animate-spin`}
            />
          ) : (
            <Icon className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${color}`} />
          )}
          {loadingProvider === id ? `Signing in...` : label}
        </Button>
      ))}
    </div>
  );

  if (compact) return buttons;

  if (!showCard) return buttons;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
            <Image
              src="/axon.svg"
              width={40}
              height={40}
              alt="logo of the app"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Welcome to Axon
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to start chatting with your documents using AI
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {buttons}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                secure authentication
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInButton;
