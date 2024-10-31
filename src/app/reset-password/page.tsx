"use client";
import { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to reset password");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">Invalid reset token</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
              minLength={6}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Reset Password"}
          </Button>

          {message && (
            <div
              className={`mt-4 text-center text-sm ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
