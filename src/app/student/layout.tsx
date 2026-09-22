"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { DemoToolbar } from "@/components/demo/demo-toolbar";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col min-h-screen bg-background text-foreground ${fraunces.variable}`}>
      <div className="hidden md:block">
        <Navbar role="student" />
      </div>
      <div className="flex flex-1 items-start">
        <div className="hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)]"><Sidebar role="student" /></div>
        <main className="flex-1 w-full min-w-0 md:p-5">{children}</main>
      </div>
      <DemoToolbar />
    </div>
  );
}
