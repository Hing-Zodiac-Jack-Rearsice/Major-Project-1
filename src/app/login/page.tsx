"use client";

import { SignupFormDemo } from "@/components/ui/SignUpFormDemo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      switch (session.user.role) {
        case "super_admin":
          router.push("/super-admin/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard/events");
          break;
        case "user":
          router.push("/events");
          break;
        default:
          router.push("/");
      }
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Only show the login form if user is not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="mt-16">
        <SignupFormDemo />
      </div>
    );
  }

  // Return null while redirect is happening
  return null;
};

export default LoginPage;
