"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./button";

interface AnimatedHeroProps {
  title1: string;
  title2: string;
  description: string;
  ctaText: string;
  hasSupabase: boolean;
}

export function AnimatedHero({ title1, title2, description, ctaText, hasSupabase }: AnimatedHeroProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24 md:pt-48 md:pb-40 flex flex-col items-center text-center">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl flex flex-col items-center"
      >
        <motion.div variants={item} className="inline-flex items-center gap-3 px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full mb-10 transition-colors hover:bg-secondary/80 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Govt. of India / Ministry of Tribal Affairs
        </motion.div>

        <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
          <span className="block text-foreground">
            {title1}
          </span>
          <span className="block text-muted-foreground mt-2">
            {title2}
          </span>
        </motion.h1>

        <motion.p variants={item} className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-medium text-balance">
          {description}
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href={hasSupabase ? "/auth/signup" : "/student/dashboard"} className="w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 rounded-full text-base font-semibold tracking-wide bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
              {ctaText} <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link href="#schemes" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-base font-semibold tracking-wide border-border/60 hover:bg-secondary w-full sm:w-auto transition-all duration-300">
              Explore Architecture
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
