"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TRIBES, TRIBES_BY_STATE } from "@/lib/data/tribes";

interface TribeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stateFilter?: string;
}

export function TribeCombobox({ value, onChange, placeholder = "Select or type tribe...", stateFilter }: TribeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter based on input and state
  const filteredTribes = React.useMemo(() => {
    let baseList = ALL_TRIBES;
    if (stateFilter && TRIBES_BY_STATE[stateFilter]) {
      baseList = TRIBES_BY_STATE[stateFilter];
    }
    
    if (!search) return baseList;
    
    const lower = search.toLowerCase();
    return baseList.filter(t => t.toLowerCase().includes(lower));
  }, [search, stateFilter]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-1 focus-within:ring-ring",
          open && "ring-1 ring-ring border-primary"
        )}
      >
        <input
          type="text"
          value={open ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setSearch("");
            setOpen(true);
          }}
          className="w-full bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground"
          placeholder={placeholder}
        />
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" onClick={() => setOpen(!open)} />
      </div>

      {open && (
        <div className="absolute z-[100] mt-1 max-h-48 w-full overflow-auto rounded-md border bg-card text-card-foreground shadow-xl animate-in fade-in-80 zoom-in-95">
          <div className="sticky top-0 bg-card px-2 pt-2 pb-1 border-b z-10 flex items-center gap-2 text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Available Tribes</span>
          </div>
          {filteredTribes.length === 0 ? (
            <div className="relative cursor-default select-none py-3 px-3 text-sm text-center text-muted-foreground">
              No matching tribes found.
            </div>
          ) : (
            <div className="p-1">
              {filteredTribes.map((tribe) => (
                <div
                  key={tribe}
                  onClick={() => {
                    onChange(tribe);
                    setSearch(tribe);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === tribe ? "bg-accent/50 text-accent-foreground font-medium" : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tribe ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tribe}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
