import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUPIN — 2045 Agent Coming Soon",
  description: "Forward. Zero Zero One. A premium futuristic AI agent.",
  keywords: ["LUPIN", "2045", "AI", "agent", "futuristic"],
  openGraph: {
    title: "LUPIN — 2045",
    description: "Forward. Zero Zero One.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="antialiased bg-black text-white overflow-hidden h-full">
        {children}
      </body>
    </html>
  );
}
