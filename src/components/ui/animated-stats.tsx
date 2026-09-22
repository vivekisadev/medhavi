"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedStats({ stats }: { stats: { value: string; label: string }[] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 lg:p-8"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item} className="rounded-[2rem] p-8 lg:p-12 bg-card border border-border/50 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-3">{stat.value}</p>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
