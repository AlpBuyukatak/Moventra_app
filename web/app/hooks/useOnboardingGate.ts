// app/hooks/useOnboardingGate.ts
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  onboardingCompleted?: boolean;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

/**
 * Eğer kullanıcı login ise ve onboardingCompleted = false ise
 * onboarding dışında hiçbir sayfayı görmesine izin vermez.
 *
 * Kullanım:
 * const { checking } = useOnboardingGate();
 * if (checking) return null; // veya skeleton
 */
export function useOnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // login/register sayfalarına kendi akışları izin veriyor
      setChecking(false);
      return;
    }

    async function check() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        const user: MeUser | undefined = data.user;

        if (!res.ok || !user) {
          window.localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        // Onboarding tamamlanmamışsa ve şu an /onboarding’te değilsek → zorla oraya
        if (!user.onboardingCompleted && pathname !== "/onboarding") {
          router.replace("/onboarding");
          return;
        }
      } catch (err) {
        console.error("Onboarding gate error:", err);
        // hata durumunda fail-open yerine login’e atmak daha güvenli
        window.localStorage.removeItem("token");
        router.replace("/login");
        return;
      } finally {
        setChecking(false);
      }
    }

    check();
  }, [router, pathname]);

  return { checking };
}
