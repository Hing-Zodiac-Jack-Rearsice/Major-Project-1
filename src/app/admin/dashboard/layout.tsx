import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import { MyFooter } from "@/components/MyFooter";
import SideNav from "@/components/dashboard/SideNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for managing events",
};

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <SideNav />
      {/* Include shared UI here e.g. a header or sidebar */}
      {children}
    </section>
  );
}
