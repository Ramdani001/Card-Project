import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import '@mantine/carousel/styles.css';
import "./globals.css";

import { NextAuthProvider } from "../components/providers/NextAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Toko Kartu - Jual Kartu Pokemon & One Piece TCG Terlengkap",
    template: "%s | Toko Kartu",
  },
  description: "Toko kartu TCG original. Jual booster box, singles, dan aksesoris kartu Pokemon, One Piece, dan Yu-Gi-Oh dengan harga terbaik.",
  keywords: ["jual kartu pokemon", "one piece tcg indonesia", "booster box murah", "toko kartu"],
  authors: [{ name: "Toko Kartu Team" }],
  metadataBase: new URL("https://toko-kartu.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Toko Kartu Original Indonesia",
    description: "Koleksi kartu TCG terlengkap dan terpercaya.",
    url: "https://tokokartu.com",
    siteName: "Toko Kartu",
    images: [
      {
        url: "/toko-kartu-logo.png",
        width: 1200,
        height: 630,
        alt: "Toko Kartu Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const theme = createTheme({
  fontFamily: geistSans.style.fontFamily,
  primaryColor: "blue",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="bottom-right" zIndex={2000} />
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
