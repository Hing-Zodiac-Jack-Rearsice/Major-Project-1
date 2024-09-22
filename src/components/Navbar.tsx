"use client";
import React from "react";

import { ThemeToggle } from "./ui/ThemeToggle";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Logo from "./ui/SombotLogo";

export default function Navbar() {
  const pathName = usePathname();
  const { data: session } = useSession();

  // comment below to stop showing the session in console
  // console.log(session);
  if (pathName.startsWith("/admin")) {
    // dont render the navbar from home page when in dashboard route
    return null;
  } else {
    return (
      <header className="fixed top-0 w-full flex items-center justify-between h-16 px-4 dark:bg-black bg-background border-b md:px-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
          prefetch={false}
        >
          <Logo width={32} height={32} />
          <h1 className="text-xl font-bold italic">SOMBOT</h1>
        </Link>
        <div className="flex">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium mr-4">
            <Link
              href="/events"
              className="hover:underline underline-offset-4"
              prefetch={false}
            >
              Events
            </Link>
            {/* <Link
              href="/events/clzaz65is0001oolazxmiw08p"
              className="hover:underline underline-offset-4"
              prefetch={false}
            >
              TEST PG
            </Link> */}
            {session?.user.role === "admin" && (
              <Link
                href="/admin/dashboard/events"
                className="hover:underline underline-offset-4"
                prefetch={false}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/plans"
              className="hover:underline underline-offset-4"
              prefetch={false}
            >
              Plans
            </Link>
            {!session ? (
              <Link
                href="/login"
                className="hover:underline underline-offset-4"
                prefetch={false}
              >
                Login
              </Link>
            ) : (
              <p
                className="hover:underline underline-offset-4 cursor-pointer"
                onClick={() => signOut()}
              >
                Sign out
              </p>
            )}
            {session?.user?.role === "admin" && (
              <a className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold">
                ADMIN
              </a>
            )}
            {session && (
              <Link
                href="/profile"
                className="hover:underline underline-offset-4"
                prefetch={false}
              >
                Profile
              </Link>
            )}
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden ">
              <div className="grid gap-4 p-4">
                <Link
                  href="/events"
                  className="flex items-center gap-2 py-2 text-lg font-medium hover:bg-muted/50 rounded-md"
                  prefetch={false}
                >
                  Events
                </Link>
                {session?.user.role === "admin" && (
                  <Link
                    href="/admin/dashboard/events"
                    className="flex items-center gap-2 py-2 text-lg font-medium hover:bg-muted/50 rounded-md"
                    prefetch={false}
                  >
                    Dashboard
                  </Link>
                )}

                <Link
                  href="/plans"
                  className="flex items-center gap-2 py-2 text-lg font-medium hover:bg-muted/50 rounded-md"
                  prefetch={false}
                >
                  Plans
                </Link>
                {!session ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 py-2 text-lg font-medium hover:bg-muted/50 rounded-md"
                    prefetch={false}
                  >
                    Login
                  </Link>
                ) : (
                  <p
                    className="flex items-center gap-2 py-2 text-lg font-medium hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </header>
    );
  }
}

function MenuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
