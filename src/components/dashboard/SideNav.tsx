"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "../ui/SombotLogo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { ThemeToggle } from "../ui/ThemeToggle";
import Billing from "./Billing";
import { faHouse, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LineChartIcon, PanelLeftIcon, SettingsIcon } from "lucide-react";

const SideNav = () => {
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);
  const { data: session } = useSession();

  useEffect(() => {
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

  const isLinkActive = (href: string) => {
    return pathname === href;
  };

  const NavLink = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
            ${
              isLinkActive(href)
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          prefetch={false}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <div>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <NavLink
              href="/"
              icon={<FontAwesomeIcon icon={faHouse} className="w-5 h-5" />}
              label="Home"
            />
            <NavLink
              href="/admin/dashboard/events"
              icon={<FontAwesomeIcon icon={faCalendarDays} className="w-5 h-5" />}
              label="Events"
            />
            <NavLink
              href="/admin/dashboard/analytic-page"
              icon={<LineChartIcon className="h-5 w-5" />}
              label="Analytics"
            />
            <NavLink
              href="/admin/dashboard/qrscanner"
              icon={<FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />}
              label="Qr Scanner"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Billing />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Billing</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:h-8 md:w-8"
                  prefetch={false}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ThemeToggle />
        </nav>
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b dark:bg-black px-4 sm:static sm:h-auto sm:border-0 sm:px-6 sm:p-2 sm:ml-14">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeftIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faHouse}
                    className="h-5 w-5 transition-all group-hover:scale-110"
                  />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <ThemeToggle />
              </div>
              <Link
                href="/admin/dashboard/events"
                className={`flex items-center gap-4 px-2.5 ${
                  isLinkActive("/admin/dashboard/events")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                prefetch={false}
              >
                <FontAwesomeIcon icon={faCalendarDays} className="w-5 h-5" />
                Events
              </Link>
              <Link
                href="/admin/dashboard/analytic-page"
                className={`flex items-center gap-4 px-2.5 ${
                  isLinkActive("/admin/dashboard/analytic-page")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                prefetch={false}
              >
                <LineChartIcon className="h-5 w-5" />
                Analytics
              </Link>
              <Link
                href="/admin/dashboard/qrscanner"
                className={`flex items-center gap-4 px-2.5 ${
                  isLinkActive("/admin/dashboard/qrscanner")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                prefetch={false}
              >
                <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                Qr Scanner
              </Link>
              <div className="w-full flex items-center">
                <Billing />
                <p>Billing</p>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold" prefetch={false}>
          <Logo width={32} height={32} />
          <h1 className="text-xl font-bold italic text-black dark:text-white">SOMBOT</h1>
        </Link>
        <div className="relative ml-auto ">
          <p className="w-full font-medium text-sm">{userData?.name}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userData?.image || ""} alt={userData?.name || ""} />
                <AvatarFallback>{userData?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </div>
  );
};

export default SideNav;
