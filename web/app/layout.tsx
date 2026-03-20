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
          overflow: "hidden", // ✅ window scroll'u kapatıyoruz
        }}
      >
        <LanguageProvider>
          <AppShell>
            {/* Tüm sayfa için dikey layout */}
            <div
              style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Üstte navbar (scroll dışında) */}
              <NavBar />

              {/* 🔽 Sadece bu alan scroll olacak + scrollbar burada */}
              <div
                className="page-scroll-area"
                style={{
                  flex: 1,
                  overflowY: "auto",
                }}
              >
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
              </div>
            </div>
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
