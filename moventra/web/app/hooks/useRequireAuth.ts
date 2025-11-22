"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bu hook sadece:
 * - client tarafında localStorage'dan token var mı bakar
 * - yoksa /login'e yönlendirir
 * 
 * Hiç useContext, AuthProvider vs YOK → "Invalid hook call" derdinden kurtuluyoruz.
 */
export default function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    // SSR'da çalışmasın
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);
}
