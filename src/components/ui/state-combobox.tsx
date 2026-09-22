"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRIBES_BY_STATE } from "@/lib/data/tribes";

interface StateComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StateCombobox({ value, onChange, placeholder = "Select or type state..." }: StateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const STATES = React.useMemo(() => Object.keys(TRIBES_BY_STATE), []);

  const filteredStates = React.useMemo(() => {
    if (!search) return STATES;
    const lower = search.toLowerCase();
    return STATES.filter(s => s.toLowerCase().includes(lower));
  }, [search, STATES]);

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
            <span className="text-[10px] font-medium uppercase tracking-widest">Available States</span>
          </div>
          {filteredStates.length === 0 ? (
            <div className="relative cursor-default select-none py-3 px-3 text-sm text-center text-muted-foreground">
              No matching states found.
            </div>
          ) : (
            <div className="p-1">
              {filteredStates.map((state) => (
                <div
                  key={state}
                  onClick={() => {
                    onChange(state);
                    setSearch(state);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === state ? "bg-accent/50 text-accent-foreground font-medium" : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === state ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {state}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
