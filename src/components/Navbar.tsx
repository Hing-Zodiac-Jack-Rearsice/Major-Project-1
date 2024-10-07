"use client";
import { CalendarDays } from "lucide-react";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ui/ThemeToggle";
import Logo from "./ui/SombotLogo";
import { Menu, Ticket, User, LogOut } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("Session data:", session);
    async function fetchUserData() {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/getUserInfo");
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    }

    fetchUserData();
  }, [session]);

  if (pathName.startsWith("/admin")) {
    return null;
  }

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        href="/events"
        className="text-sm font-medium hover:text-primary"
        prefetch={false}
        onClick={() => mobile && handleNavigation("/events")}
      >
        Events
      </Link>
      <Link
        href="/plans"
        className="text-sm font-medium hover:text-primary"
        prefetch={false}
        onClick={() => mobile && handleNavigation("/plans")}
      >
        Plans
      </Link>
      {session?.user.role === "admin" && (
        <Link
          href="/admin/dashboard/events"
          className="text-sm font-medium hover:text-primary"
          prefetch={false}
          onClick={() => mobile && handleNavigation("/admin/dashboard/events")}
        >
          Dashboard
        </Link>
      )}
      {(session?.user.role === "user" || session?.user.role === "admin") && (
        <Link
          href="/contactUs"
          className="text-sm font-medium hover:text-primary"
          prefetch={false}
          onClick={() => mobile && handleNavigation("/contactUs")}
        >
          Contact Us
        </Link>
      )}
    </>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="container flex h-14 items-center justify-between px-0">
        <div className="flex gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" prefetch={false}>
            <div className="hidden md:block">
              <Logo width={32} height={32} />
            </div>
            <div className="md:hidden">
              <Logo width={28} height={28} />
            </div>
            <h1 className="text-xl font-bold italic whitespace-nowrap">SOMBOT</h1>
          </Link>
          {session?.user.role === "admin" && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2"
                >
                  ADMIN
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-fit">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <p className="text-sm">You are viewing as admin.</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
          {session?.user.role === "super_admin" && (
            <Link href="/super-admin/dashboard">
              <Button
                variant="default"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-2"
              >
                SUPER ADMIN
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center ">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>
          <div className="hidden md:block mx-4">
            {session?.user.role === "user" && (
              <Link href="/tickets" prefetch={false}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="icon">
                        <Ticket className="h-5 w-5" />
                        <span className="sr-only">My Tickets</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View your tickets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            )}
            <ThemeToggle />
          </div>
          {!session ? (
            <Button asChild className="hidden md:inline-flex">
              <Link href="/login" prefetch={false}>
                Login
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden md:inline-flex">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.image || ""} alt={userData?.name || ""} />
                    <AvatarFallback>{userData?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {session.user.role !== "admin" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center" prefetch={false}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4">
                {session && userData && (
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData.image || ""} alt={userData.name || ""} />
                      <AvatarFallback>{userData.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userData.name}</p>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                    </div>
                  </div>
                )}
                <nav className="flex flex-col space-y-4">
                  <NavLinks mobile />
                  {session?.user.role === "user" && (
                    <Link href="/tickets" className="flex items-center" prefetch={false}>
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>My Tickets</span>
                    </Link>
                  )}
                  {!session ? (
                    <Link href="/login" className="flex items-center" prefetch={false}>
                      Login
                    </Link>
                  ) : (
                    <>
                      {session.user.role !== "admin" ? (
                        <Link href="/profile" className="flex items-center" prefetch={false}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      ) : null}
                      <button onClick={() => signOut()} className="flex items-center text-left">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </>
                  )}
                </nav>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
