"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Chrome, Mail, Lock, ArrowRight, Languages } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const t = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(t("error"));
        return;
      }

      if (res?.ok) {
        toast.success("Willkommen zurück!");
        router.push("/");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Konto erfolgreich erstellt!");
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          router.push("/");
          router.refresh();
        } else {
          window.location.reload();
        }
      } else {
        if (data.error === "email_exists") {
          toast.error(t("email_exists"));
        } else {
          toast.error(t("error"));
        }
      }
    } catch (err) {
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Decorative Background (Abstract/Geometric) */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[150px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px]" />
          
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 z-10" />
        
        <div className="relative z-20 flex flex-col justify-center px-12 lg:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
              <Languages className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              {activeTab === "login" ? "Willkommen zurück" : "Starte deine Reise"}
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
              {activeTab === "login" 
                ? "Setze dein Deutsch-Training fort und lerne alle 185 Verben mit Präpositionen." 
                : "Tritt unserer Community bei und lerne Deutsch im Duolingo-Stil."}
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-12 flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {["925+ Sätze", "A2 Level", "Gamified", "Kostenlos"].map((badge) => (
              <div key={badge} className="px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-sm font-medium text-slate-300">
                {badge}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] space-y-8"
        >
          <div className="text-center md:text-left space-y-2">
            <div className="md:hidden w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {activeTab === "login" ? "Anmelden" : "Registrieren"}
            </h2>
            <p className="text-slate-500">
              {activeTab === "login" 
                ? "Schön, dass du wieder da bist!" 
                : "Erstelle ein Konto, um deinen Fortschritt zu speichern."}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                {t("login")}
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Registrieren
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "login" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "login" ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={activeTab === "login" ? handleLogin : handleRegister} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-white border-slate-200 rounded-xl focus:border-green-500 focus:ring-green-500 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-medium ml-1">Passwort</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                          <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-white border-slate-200 rounded-xl focus:border-green-500 focus:ring-green-500 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className={`w-full h-12 mt-4 rounded-xl text-lg font-semibold transition-all shadow-md active:scale-[0.98] ${
                        activeTab === "login" 
                          ? "bg-green-500 hover:bg-green-600 shadow-green-100" 
                          : "bg-blue-500 hover:bg-blue-600 shadow-blue-100"
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("loading")}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {activeTab === "login" ? t("login") : "Konto erstellen"}
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          <p className="text-center text-xs text-slate-400 px-8">
            Durch die Anmeldung akzeptierst du unsere Nutzungsbedingungen und Datenschutzrichtlinien.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

