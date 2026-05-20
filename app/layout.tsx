import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Warehouse",
  description: "Lagos direct rental platform landing page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#f6f4f1]">{children}</body>
    </html>
  );
}
