"use client";

import { useState } from "react";
import { updateNativeLanguage } from "./actions";
import { toast } from "sonner";
import { LanguagePicker } from "@/components/language-picker";

export function LanguageSelector({ currentLanguage }: { currentLanguage: string }) {
  const [lang, setLang] = useState(currentLanguage || "RU");

  const handleChange = async (newLang: string) => {
    setLang(newLang);
    try {
      await updateNativeLanguage(newLang);
      toast.success("Sprache aktualisiert");
    } catch (err) {
      toast.error("Fehler beim Aktualisieren der Sprache");
    }
  };

  return (
    <LanguagePicker 
      value={lang} 
      onValueChange={handleChange}
      triggerClassName="sm:w-56 h-10 px-4"
    />
  );
}


