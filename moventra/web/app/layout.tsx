import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { LanguageProvider } from "./context/LanguageContext";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        <LanguageProvider>
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
        </LanguageProvider>
      </body>
    </html>
  );
}
