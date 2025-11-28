"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * useRequireAuth
 *
 * - Client tarafında localStorage'dan token kontrol eder.
 * - Token yoksa redirectTo (varsayılan: "/login") adresine yönlendirir.
 * - checking=true iken sayfa içeriğini render etmeyip "Checking..." gösterebilirsin.
 */
export default function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = window.localStorage.getItem("token");

    if (!storedToken) {
      // Kullanıcı login değil → login sayfasına gönder
      router.replace(redirectTo);
      setChecking(false);
      setToken(null);
      return;
    }

    // İstersen ileride burada /auth/me ile token'ı validate edebilirsin
    setToken(storedToken);
    setChecking(false);
  }, [router, redirectTo, pathname]);

  return { checking, token };
}

