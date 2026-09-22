"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  tag?: string;
  stats?: { label: string; val: string }[];
  className?: string;
}

export function BentoGrid({ items, className }: { items: BentoItem[]; className?: string }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}
    >
      {items.map((item, i) => (
        <motion.div key={i} variants={itemVariant} className={cn("h-full", item.className)}>
          <div className="h-full bg-card rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col group">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-secondary rounded-2xl text-foreground">
                {item.icon}
              </div>
              {item.tag && (
                <span className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-secondary text-foreground rounded-full">
                  {item.tag}
                </span>
              )}
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-foreground">{item.title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 flex-grow">
              {item.description}
            </p>
            
            {item.stats && (
              <div className="space-y-4 pt-6 border-t border-border/50">
                {item.stats.map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{stat.label}</span>
                    <span className="font-semibold text-foreground">{stat.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
