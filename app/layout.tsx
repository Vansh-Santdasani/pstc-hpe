import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pune Tech Council × HPE — Securing Tomorrow, Today",
  description:
    "HPE Gen12 Quantum-Safe Security & Next-Gen Cybersecurity Workshop. A Pune Tech Council initiative.",
  keywords: [
    "HPE",
    "Pune Tech Council",
    "Quantum Security",
    "Post-Quantum Cryptography",
    "CyberBlocks",
    "Gen12",
  ],
  authors: [{ name: "Pune Tech Council" }],
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0e0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-obsidian">
      <head>
        {/* Google Fonts — distinctive choices, not Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-obsidian text-fg antialiased">{children}</body>
    </html>
  );
}
