"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";

const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface UserData {
  name: string;
  email: string;
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(
    hasSupabase ? null : { name: "Guest User", email: "guest@niyomi.gov.in" }
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasSupabase) return;

    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({
            name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
            email: data.user.email || "",
          });
        }
      });
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          });
        } else {
          setUser(null);
        }
      });
    });
  }, []);

  const handleLogout = async () => {
    if (hasSupabase) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    }
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 px-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
      >
        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="hidden sm:inline">{user.name}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-card shadow-md py-1 animate-fadeIn">
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-medium text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
