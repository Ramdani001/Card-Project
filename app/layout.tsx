import "@mantine/core/styles.css";

import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@mantine/core/styles.css";
import { NextAuthProvider } from "../components/providers/NextAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toko Kartu",
  description: "",
};

const theme = createTheme({
  fontFamily: geistSans.style.fontFamily,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextAuthProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="bottom-right" />
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
