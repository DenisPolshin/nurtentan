"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
