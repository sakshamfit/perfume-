import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELORA Paris — The essence of subtle romance",
  description:
    "Discover Éclat by VELORA Paris. A luminous blend of peach, jasmine and soft woods. Crafted for moments that stay with you.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
