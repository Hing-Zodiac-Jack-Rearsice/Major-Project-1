"use client";
import React, { useState } from "react";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import Logo from "./SombotLogo";
import axios from "axios";
import { randomUUID } from "crypto";
import { useRouter } from "next/navigation";

export function SignupFormDemo() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        console.log("Login successful");
        const session = await getSession();
        console.log("Session after login:", session);
        window.location.href = "/events";
      }
    } else {
      // Handle registration
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("User registered:", result.user);
          // Sign in the user after successful registration
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (signInResult?.ok) {
            console.log("Login successful after registration");
            window.location.href = "/events";
          } else {
            setError(
              "Registration successful, but login failed. Please try logging in."
            );
          }
        } else {
          const error = await response.json();
          setError(error.error || "Failed to sign up");
        }
      } catch (error) {
        console.error("Registration error:", error);
        setError("Failed to sign up");
      }
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "http://localhost:3000/events" });
  };

  return (
    <div className="flex items-center">
      {/* Image/Logo Section */}
      <div className="flex-1 hidden sm:block">
        <Logo />
      </div>
      {/* Form Section */}
      <div className="flex-1 w-full mx-auto rounded-none p-4 md:p-8 border-l bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {isLogin ? "Sign in to your account" : "Sign up for a new account"}
        </p>
        {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
        <form className="my-8" onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="flex flex-col space-y-2 mb-4">
            {!isLogin && (
              <LabelInputContainer>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </LabelInputContainer>
            )}
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="johndoe@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </LabelInputContainer>
            {!isLogin && (
              <LabelInputContainer>
                <Label htmlFor="confirm-password">Confirm your password</Label>
                <Input
                  id="confirm-password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </LabelInputContainer>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            {isLogin ? "Sign in" : "Sign up"} &rarr;
            <BottomGradient />
          </button>

          {/* Divider */}
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          {/* Google Sign In Button */}
          <div className="flex flex-col space-y-4">
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              onClick={handleGoogleSignIn}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                Sign in with Google
              </span>
              <BottomGradient />
            </button>
          </div>

          {/* Toggle Login/Register */}
          <p className="text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="text-blue-500 hover:underline ml-1"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register now" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

async function createSession(user: any) {
  const session = await prisma.session.create({
    data: {
      sessionToken: randomUUID(),
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
  return session;
}
