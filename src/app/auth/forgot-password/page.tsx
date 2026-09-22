"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess("Check your email for a password reset link.");
    }
    setLoading(false);
  };

  return (
    <Card className="animate-card-in">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-3">
          <GraduationCap className="h-6 w-6 text-background" />
        </div>
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        {success && <p className="text-xs text-emerald-600 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9 text-xs" required />
          </div>
          <Button type="submit" className="w-full h-9 text-xs" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
