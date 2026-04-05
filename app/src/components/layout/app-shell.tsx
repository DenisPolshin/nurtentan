"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-green-600 tracking-tight">DeutschLernen</span>
          </Link>
        </div>

        {session?.user && (
          <div className="flex items-center gap-3">
             {isAdmin && (
               <Link href="/admin">
                 <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-full font-semibold">
                   <ShieldCheck className="h-4 w-4" />
                   Admin Panel
                 </Button>
               </Link>
             )}
             <div className="flex items-center gap-2 bg-slate-100 p-1 pr-3 rounded-full border border-slate-200">
                <Avatar className="h-8 w-8">
                   <AvatarImage src={session.user.image || ""} />
                   <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                       {session.user.name?.charAt(0) || session.user.email?.charAt(0)?.toUpperCase() || "U"}
                   </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold truncate text-slate-700 max-w-[100px]">
                    {session.user.name || session.user.email?.split('@')[0]}
                </span>
                <div className="h-4 w-[1px] bg-slate-300 mx-1" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  onClick={handleLogout}
                  title="Abmelden"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
