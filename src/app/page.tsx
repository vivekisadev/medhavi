"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Shield, FileCheck, Brain, Users, Globe, ExternalLink, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { TeamRevealGrid } from "@/components/ui/team-reveal-grid";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedStats } from "@/components/ui/animated-stats";
import { motion } from "framer-motion";

const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LandingPage() {
  const { language, setLanguage, tr } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const features = [
    { 
      icon: <Brain className="h-6 w-6" />, 
      title: "Automated Verification", 
      description: "Machine learning based document extraction and validation. Instantly cross-checks submitted PDFs and JPEGs against predefined rubrics.",
      className: "md:col-span-2 lg:col-span-1"
    },
    { 
      icon: <FileCheck className="h-6 w-6" />, 
      title: "Deterministic Rules", 
      description: "Eligibility logic is strictly hard-coded into matrix evaluations ensuring zero bias in application screening.",
      className: "md:col-span-1"
    },
    { 
      icon: <Shield className="h-6 w-6" />, 
      title: "DigiLocker Native", 
      description: "Direct integration with Government APIs for cryptographically authentic academic and identity records.",
      className: "md:col-span-1"
    },
    { 
      icon: <Users className="h-6 w-6" />, 
      title: "Role-Based Access", 
      description: "Strict separation between applicant UI and official scrutiny dashboard, protected by robust row-level security.",
      className: "md:col-span-2"
    },
    { 
      icon: <Activity className="h-6 w-6" />, 
      title: "Real-time Auditing", 
      description: "Every action taken by officials is logged with immutable cryptographic trails for full accountability.",
      className: "md:col-span-2 lg:col-span-3"
    }
  ];

  const schemes = [
    {
      title: "National Overseas Scholarship",
      description: "Financial assistance for ST students pursuing Master's and Ph.D. at foreign universities ranked in the QS Top 1000.",
      icon: <Globe className="h-8 w-8" />,
      tag: "NOS",
      stats: [
        { label: "Income Limit", val: "≤ ₹6,00,000" },
        { label: "Age Limit", val: "32 (Masters), 35 (PhD)" },
        { label: "University", val: "QS Rank ≤ 1000" }
      ],
      className: "lg:col-span-2"
    },
    {
      title: "National Fellowship",
      description: "Fellowship for ST research scholars pursuing Ph.D. in UGC recognized Indian institutions. Prioritizing PVTG scholars.",
      icon: <BookOpen className="h-8 w-8" />,
      tag: "NFST",
      stats: [
        { label: "Qualification", val: "UGC-NET / JRF" },
        { label: "Institution", val: "Indian Univs" },
        { label: "Priority", val: "PVTG Students" }
      ],
      className: "lg:col-span-1"
    }
  ];

  const teamMembers = [
    { id: "vivek", name: "Vivek Verma", role: "Team Lead / Full Stack Developer", expertise: "Leads development, architecture, and deployment strategy.", accent: "#fb4f43", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&b=%23fb4f43" },
    { id: "jalaj", name: "Jalaj Sharma", role: "Backend Developer", expertise: "Builds scalable backend systems and integrations.", accent: "#3b82f6", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jalaj&b=%233b82f6" },
    { id: "anushka", name: "Anushka", role: "UI/UX Designer", expertise: "Designs intuitive and accessible user interfaces.", accent: "#10b981", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&b=%2310b981" },
    { id: "ridham", name: "Ridham", role: "Frontend Developer", expertise: "Implements responsive and dynamic front-end features.", accent: "#8b5cf6", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jack&b=%238b5cf6" },
    { id: "shrishti", name: "Shrishti", role: "Research / QA", expertise: "Ensures product quality and conducts thorough research.", accent: "#f59e0b", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jocelyn&b=%23f59e0b" },
    { id: "suhasni", name: "Suhasni", role: "Data/AI Engineer", expertise: "Works on data pipelines and artificial intelligence integrations.", accent: "#ec4899", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Suhasni&b=%23ec4899" }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-foreground selection:text-background flex flex-col">

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 transition-all">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-white flex items-center justify-center rounded-[0.5rem] overflow-hidden border border-border shadow-sm">
            <img src="/logo.jpg" alt="Medhavi Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-base uppercase">Medhavi</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleLanguage} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest hidden sm:block">
            {language === "en" ? "HI" : "EN"}
          </button>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <ThemeToggle />
          <div className="w-px h-4 bg-border hidden sm:block" />
          <Link href={hasSupabase ? "/auth/login" : "/student/dashboard"} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            {tr("nav.signin")}
          </Link>
          <Link href={hasSupabase ? "/auth/signup" : "/student/dashboard"}>
            <Button size="sm" className="text-sm rounded-full h-10 px-6 font-semibold tracking-wide bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-105">
              {tr("nav.getstarted")}
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-grow pt-20 overflow-hidden">
        {/* Hero */}
        <AnimatedHero 
          title1={tr("hero.title1")} 
          title2={tr("hero.title2")} 
          description="A high-performance digital infrastructure for end-to-end management of MoTA scholarship and fellowship schemes. Engineered for transparency, speed, and accuracy."
          ctaText={tr("hero.cta1")}
          hasSupabase={hasSupabase}
        />

        {/* Stats Grid */}
        <section className="relative z-20 mb-32">
          <AnimatedStats stats={[
            { value: "50,000+", label: tr("stats.students") },
            { value: "₹2,400 Cr", label: tr("stats.disbursed") },
            { value: "120+", label: tr("stats.universities") },
            { value: "98.5%", label: tr("stats.accuracy") },
          ]} />
        </section>

        {/* Schemes / Architecture */}
        <section id="schemes" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-32">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">Core Schemes Supported</h2>
            <p className="text-xl text-muted-foreground font-medium text-balance leading-relaxed">
              Strictly typed eligibility matrices for the flagship MoTA programs, ensuring deterministic outcomes for every application.
            </p>
          </div>
          
          <BentoGrid items={schemes} />
        </section>

        {/* Features Minimal */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-32">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">Technical Infrastructure</h2>
            <p className="text-xl text-muted-foreground font-medium text-balance leading-relaxed">
              Built with a focus on reliability, strict typings, and zero-downtime deployments. Designed to scale gracefully.
            </p>
          </div>
          
          <BentoGrid items={features} className="grid-cols-1 md:grid-cols-3 lg:grid-cols-4" />
        </section>

        {/* Team Reveal Grid */}
        <section className="py-24 md:py-32">
          <TeamRevealGrid members={teamMembers} />
        </section>

        {/* Developer / Official CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-40">
          <div className="bg-foreground text-background rounded-[3rem] p-12 md:p-24 flex flex-col items-center text-center gap-10 shadow-2xl">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-background">Ministry Portal Access</h2>
              <p className="text-background/80 text-lg md:text-xl max-w-2xl mx-auto font-medium text-balance leading-relaxed">
                Secure, authenticated access for reviewing officers to inspect applications, verify AI outputs, and issue disbursements.
              </p>
            </div>
            <Link href="/official/dashboard">
              <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold tracking-wide bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all shadow-lg">
                Officer Login <ExternalLink className="h-6 w-6 ml-3" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background pt-24 pb-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-24">
            {/* Left Side */}
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="h-10 w-10 bg-foreground flex items-center justify-center rounded-[0.5rem] shadow-sm group-hover:scale-105 transition-transform">
                  <span className="text-background font-bold text-base">M</span>
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
                  Medhavi
                </span>
              </Link>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Our mission is to offer ST students a seamless, AI-powered scholarship experience with zero friction.
              </p>
            </div>

            {/* Right Side Links */}
            <div className="flex gap-16 text-base font-semibold text-muted-foreground">
              <div className="flex flex-col gap-4">
                <p className="text-foreground font-bold mb-2">Platform</p>
                <Link href="/student/dashboard" className="hover:text-foreground transition-colors">Student Portal</Link>
                <Link href="/official/dashboard" className="hover:text-foreground transition-colors">Ministry Portal</Link>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-foreground font-bold mb-2">Resources</p>
                <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
                <Link href="https://github.com/Ashutoshx7" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</Link>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-muted-foreground">
            <p>© {new Date().getFullYear()} Ministry of Tribal Affairs. All rights reserved.</p>
            <p>Made with precision and strict typings.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
