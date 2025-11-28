import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { LanguageProvider, type Language } from "./context/LanguageContext";
import Footer from "./components/Footer";
import AppShell from "./AppShell"; // 🔐 onboarding gate burada çalışacak

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moventra",
  description: "Find people with similar hobbies and join events together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Şimdilik server tarafında sabit "en".
  // Gerçek dil tespiti LanguageProvider içinde
  // navigator + localStorage ile client tarafında yapılıyor.
  const initialLanguage: Language = "en";

  return (
    <html
      lang={initialLanguage}
      suppressHydrationWarning
      className="light"
    >
      <head>
        {/* Tema flaşını engelleyen script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    // İlk girişte her zaman 'light', sonrasında kullanıcının seçimi
    var theme = (stored === 'light' || stored === 'dark')
      ? stored
      : 'light';

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f7f3e9", // 🌼 global krem arka plan
          color: "#3b2d10",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Dil durumu: client tarafında LanguageProvider yönetiyor */}
        <LanguageProvider>
          {/* 🔐 Onboarding tamamlanana kadar kullanıcıyı /onboarding’te tutan katman */}
          <AppShell>
            <NavBar />
            <main
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "1.5rem 1rem",
              }}
            >
              {children}
            </main>
            <Footer />
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
