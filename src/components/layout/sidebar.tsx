"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/lightswind/sidebar";

interface SidebarProps {
  role: "student" | "official";
}

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/dashboard?tab=overview", label: "My Applications", icon: FileText },
  { href: "/student/dashboard?tab=documents", label: "Documents", icon: GraduationCap },
];

const officialNav = [
  { href: "/official/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/official/dashboard?tab=queue", label: "Review Queue", icon: FileText },
  { href: "/official/dashboard?tab=analytics", label: "Analytics", icon: Users },
];

export function Sidebar({ role }: SidebarProps) {
  return (
    <React.Suspense fallback={<div className="w-56 h-full bg-card border-r animate-pulse" />}>
      <SidebarInner role={role} />
    </React.Suspense>
  );
}

function SidebarInner({ role }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navItems = role === "student" ? studentNav : officialNav;

  return (
    <SidebarProvider defaultExpanded={true}>
      <SidebarRoot className="h-full border-r border-border/40 bg-card z-30">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="mt-2 text-muted-foreground">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  let isActive = false;
                  if (item.href.includes("?tab=")) {
                    isActive = pathname === item.href.split("?")[0] && searchParams.get("tab") === item.href.split("?tab=")[1];
                  } else {
                    isActive = pathname === item.href && !searchParams.get("tab");
                  }

                  return (
                    <SidebarMenuItem key={item.href} value={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3 border-t border-border/40">
          <SidebarTrigger className="w-full h-10 flex items-center justify-center rounded-lg bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" />
        </SidebarFooter>
      </SidebarRoot>
    </SidebarProvider>
  );
}
