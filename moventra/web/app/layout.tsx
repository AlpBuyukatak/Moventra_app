import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 🔥 Navbar buraya eklendi */}
        <NavBar />

        {/* 🔥 Tüm sayfa içerikleri */}
        <main
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
