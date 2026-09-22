"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, GraduationCap, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  return (
    <Card className="animate-card-in">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-3">
          <GraduationCap className="h-6 w-6 text-background" />
        </div>
        <CardTitle className="text-xl">Update password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        {success && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Password updated! Redirecting...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} placeholder="New password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-8 pr-8 h-9 text-xs" minLength={6} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button type="submit" className="w-full h-9 text-xs" disabled={loading || success}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
