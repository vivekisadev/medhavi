"use client";

import React from "react";
import Link from "next/link";
import { Bell, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface NavbarProps {
  role: "student" | "official";
}

export function Navbar({ role }: NavbarProps) {
  const { language, setLanguage } = useLanguage();
  const toggleLanguage = () => setLanguage(language === "en" ? "hi" : "en");
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-5 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-xs">M</span>
          </div>
          <span className="font-semibold text-foreground text-[15px] tracking-tight uppercase">
            Medhavi
          </span>
        </Link>
        <span className="text-border mx-0.5">|</span>
        <Badge variant="outline" className="text-[10px] font-normal py-0">
          {role === "student" ? (
            <><GraduationCap className="h-3 w-3 mr-1" />Student Portal</>
          ) : (
            <><Shield className="h-3 w-3 mr-1" />Official Portal</>
          )}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleLanguage} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mr-2">
          {language === "en" ? "HI" : "EN"}
        </button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative text-muted-foreground h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold">
            3
          </span>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
