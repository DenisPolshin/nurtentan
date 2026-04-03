"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import React from "react";

const AppShell = dynamic(() => import("./app-shell").then((mod) => mod.AppShell), {
  ssr: false,
});

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
