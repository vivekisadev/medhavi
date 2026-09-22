import * as React from "react";
import { cn } from "@/lib/utils";

interface MeshCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blobs?: React.ReactNode;
}

export function MeshCard({ className, children, blobs, ...props }: MeshCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 shadow-sm",
        className
      )}
      {...props}
    >
      {/* Blobs Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.85] dark:opacity-30">
        {blobs}
      </div>
      
      {/* Premium Noise Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {children}
      </div>
    </div>
  );
}
