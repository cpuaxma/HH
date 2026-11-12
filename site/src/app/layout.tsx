import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Hanken_Grotesk, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Roboto Condensed", "sans-serif"],
});

const text = Hanken_Grotesk({
  variable: "--font-text",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "swap",
});

const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: "variable",
  display: "swap",
  preload: false,
});

const title = "Hot Pepper Media · Social media marketing agency in Beirut";
const description =
  "Hot Pepper Media is a social media marketing agency in Beirut. Strategy, content, community management, paid ads and reporting for businesses of every kind.";

export const metadata: Metadata = {
  // [Placeholder] Replace with the real domain once it is connected in Vercel.
  metadataBase: new URL("https://hotpeppermedia.example"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Hot Pepper Media" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0b0908",
  colorScheme: "dark",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
