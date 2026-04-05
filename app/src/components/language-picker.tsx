"use client";

import { useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export const languages = [
  { value: "RU", label: "Русский", flag: "🇷🇺", code: "RU" },
  { value: "TR", label: "Türkçe", flag: "🇹🇷", code: "TR" },
  { value: "SR", label: "Српски", flag: "🇷🇸", code: "SR" },
  { value: "SQ", label: "Shqip", flag: "🇦🇱", code: "SQ" },
  { value: "UK", label: "Українська", flag: "🇺🇦", code: "UK" },
  { value: "PL", label: "Polski", flag: "🇵🇱", code: "PL" },
  { value: "HU", label: "Magyar", flag: "🇭🇺", code: "HU" },
];

interface LanguagePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function LanguagePicker({ value, onValueChange, triggerClassName, placeholder = "Sprache wählen" }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const currentLang = languages.find((l) => l.value === value) || languages[0];

  const handleChange = (newValue: string) => {
    onValueChange(newValue);
    setOpen(false);
  };

  const List = () => (
    <div className="flex flex-col p-1">
      {languages.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => handleChange(l.value)}
          className={cn(
            "flex items-center gap-4 w-full px-3 py-3 text-sm font-semibold rounded-xl transition-all outline-none",
            value === l.value 
              ? "bg-blue-50/50 text-blue-600" 
              : "hover:bg-slate-50 text-slate-600 active:bg-slate-100"
          )}
        >
          <span className="w-8 text-xs font-bold shrink-0 text-center text-slate-400">
            {l.code}
          </span>
          <span className="flex-1 text-left leading-snug">
            {l.label}
          </span>
          {value === l.value && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
        </button>
      ))}
    </div>
  );

  const Trigger = (
    <Button 
      type="button"
      variant="outline" 
      className={cn(
        "h-10 px-3 bg-white border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold flex items-center justify-between gap-3 shadow-sm active:scale-[0.98]", 
        triggerClassName
      )}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Languages className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-400 w-5 shrink-0">{currentLang.code}</span>
        <span className="truncate text-slate-700 leading-snug">{currentLang.label}</span>
      </div>
      <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200", open && "rotate-180")} />
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {Trigger}
        </PopoverTrigger>
        <PopoverContent className="w-60 p-1 rounded-2xl shadow-xl border-slate-200 overflow-hidden" align="end" sideOffset={8}>
          <List />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {Trigger}
      </DrawerTrigger>
      <DrawerContent className="p-0 rounded-t-[32px] border-none outline-none max-h-[85dvh] bg-white">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200" />
        <DrawerHeader className="px-6 pt-6 pb-4">
          <DrawerTitle className="text-left text-2xl font-bold text-slate-900">
            {placeholder}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-12 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {languages.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => handleChange(l.value)}
                className={cn(
                  "flex items-center gap-6 w-full px-5 py-5 text-lg font-bold rounded-2xl transition-all outline-none",
                  value === l.value 
                    ? "bg-blue-50 text-blue-600" 
                    : "hover:bg-slate-50 text-slate-700 active:bg-slate-100"
                )}
              >
                <span className={cn(
                  "w-10 text-sm font-black shrink-0 text-left tracking-tighter",
                  value === l.value ? "text-blue-600" : "text-slate-400"
                )}>
                  {l.code}
                </span>
                <span className="flex-1 text-left leading-snug">
                  {l.label}
                </span>
                {value === l.value && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
