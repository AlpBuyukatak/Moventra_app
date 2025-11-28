"use client";

import type { ReactNode } from "react";
import { useOnboardingGate } from "./hooks/useOnboardingGate";

export default function AppShell({ children }: { children: ReactNode }) {
  // Sadece çalıştırmamız yeterli; redirect işini kendi yapıyor
  useOnboardingGate();

  return <>{children}</>;
}
