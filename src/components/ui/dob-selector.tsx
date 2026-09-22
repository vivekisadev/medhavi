"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DobSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DobSelector({ value, onChange }: DobSelectorProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-");
      if (y && m && d) {
        setYear(y);
        setMonth(m);
        setDay(d);
      }
    }
  }, [value]);

  const updateDob = (d: string, m: string, y: string) => {
    if (d && m && y && d.length === 2 && m.length === 2 && y.length === 4) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange("");
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDay(val);
    updateDob(val, month, year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMonth(val);
    updateDob(day, val, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setYear(val);
    updateDob(day, month, val);
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const months = [
    { v: "01", l: "Jan" },
    { v: "02", l: "Feb" },
    { v: "03", l: "Mar" },
    { v: "04", l: "Apr" },
    { v: "05", l: "May" },
    { v: "06", l: "Jun" },
    { v: "07", l: "Jul" },
    { v: "08", l: "Aug" },
    { v: "09", l: "Sep" },
    { v: "10", l: "Oct" },
    { v: "11", l: "Nov" },
    { v: "12", l: "Dec" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) =>
    String(currentYear - 15 - i),
  );

  return (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <select
          value={day}
          onChange={handleDayChange}
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !day && "text-muted-foreground",
          )}
        >
          <option value="" disabled hidden className="bg-background text-muted-foreground">
            Day
          </option>
          {days.map((d) => (
            <option key={d} value={d} className="bg-background text-foreground">
              {d}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>

      <div className="relative flex-[1.5]">
        <select
          value={month}
          onChange={handleMonthChange}
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !month && "text-muted-foreground",
          )}
        >
          <option value="" disabled hidden className="bg-background text-muted-foreground">
            Month
          </option>
          {months.map((m) => (
            <option key={m.v} value={m.v} className="bg-background text-foreground">
              {m.l}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>

      <div className="relative flex-1">
        <select
          value={year}
          onChange={handleYearChange}
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !year && "text-muted-foreground",
          )}
        >
          <option value="" disabled hidden className="bg-background text-muted-foreground">
            Year
          </option>
          {years.map((y) => (
            <option key={y} value={y} className="bg-background text-foreground">
              {y}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
