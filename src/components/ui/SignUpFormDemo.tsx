"use client";
import React, { useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconBrandGoogle } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SignupFormDemo() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { data: session } = useSession();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isLogin && !acceptTerms) {
      setError("You must accept the terms and conditions to sign up.");
      return;
    }

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
        router.push("/events");
      }
    } else {
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
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (signInResult?.ok) {
            console.log("Login successful after registration");
            router.push("/events");
          } else {
            setError("Registration successful, but login failed. Please try logging in.");
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
    if (!isLogin && !acceptTerms) {
      setError("You must accept the terms and conditions to sign up with Google.");
      return;
    }
    signIn("google", { callbackUrl: "http://localhost:3000/events" });
  };

  const termsAndConditions = `
    1. Acceptance of Terms
    By accessing and using Sombot, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our service.

    2. Description of Service
    Sombot provides an online platform for event management and ticket sales. We act as an intermediary between event organizers and attendees.

    3. User Accounts
    You must create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.

    4. User Conduct
    You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You must not attempt to gain unauthorized access to any part of the service or any system or network connected to the service.

    5. Intellectual Property
    The content, organization, graphics, design, and other matters related to Sombot are protected under applicable copyrights and other proprietary laws. Copying, redistribution, use or publication of any such matters or any part of the service is prohibited.

    6. Limitation of Liability
    Sombot shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

    7. Governing Law
    These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.

    8. Changes to Terms
    We reserve the right to modify these terms at any time. We will always post the most current version on our site. By continuing to use the service after changes become effective, you agree to be bound by the revised terms.

    9. Contact
    If you have any questions about these Terms, please contact us at support@sombot.com.
  `;

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center min-h-screen bg-gray-100 dark:bg-black sm:px-6 px-4 sm:mt-24 sm:mb-10 mb-5 mt-20">
      <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center">
        <div className="w-full h-full max-w-md max-h-[600px] relative">
          <img
            src="/iphoneQR.png"
            alt="QR Code"
            className="w-full h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>

      <Card className="w-full md:w-1/2 rounded-none md:rounded-lg shadow-none md:shadow-lg flex flex-col">
        <CardHeader className="p-4 md:p-8">
          <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account" : "Sign up for a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-8 flex-grow flex flex-col">
          <Tabs
            defaultValue="login"
            onValueChange={(value) => setIsLogin(value === "login")}
            className="flex-grow flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="flex-grow flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="johndoe@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit">
                  Sign in
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="flex-grow flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="johndoe@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      placeholder="••••••••"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setShowTerms(true)}
                      >
                        terms and conditions
                      </Button>
                    </label>
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit">
                  Sign up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-4 md:p-8">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <IconBrandGoogle className="mr-2 h-4 w-4" />
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>Please read our terms and conditions carefully.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow h-screen">
            <div className="p-4 space-y-4">
              {termsAndConditions.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setShowTerms(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
