/* eslint-disable @next/next/no-img-element */

import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/carousel/styles.css";
import "./globals.css";

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import MetaPixel from "@/components/layout/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toko-kartu.com"),

  title: {
    default: "Toko Kartu - Jual Kartu Pokemon & One Piece TCG Terlengkap",
    template: "%s | Toko Kartu",
  },

  description:
    "Jual kartu Pokémon TCG, One Piece Card Game, Yu-Gi-Oh, booster box, single card, dan aksesoris original dengan harga terbaik di Indonesia.",

  keywords: ["pokemon tcg indonesia", "one piece tcg indonesia", "jual kartu pokemon", "booster box pokemon", "single card pokemon", "toko kartu"],

  alternates: {
    canonical: "https://toko-kartu.com",
  },

  openGraph: {
    title: "Toko Kartu Original Indonesia",
    description: "Koleksi kartu TCG original terlengkap dan terpercaya di Indonesia.",

    url: "https://toko-kartu.com",
    siteName: "Toko Kartu",

    images: [
      {
        url: "/toko-kartu-logo.png",
        width: 1200,
        height: 630,
        alt: "Toko Kartu",
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

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (
            function(w,d,s,l,i)
              {w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
              }
            )(window,document,'script','dataLayer','GTM-NWGTW53Q')
          `}
        </Script>

        {/* Facebook Pixel */}
        <Script id="facebook-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod ?
                n.callMethod.apply(n,arguments) :
                n.queue.push(arguments)
              };

              if(!f._fbq)f._fbq=n;

              n.push=n;
              n.loaded=true;
              n.version='2.0';
              n.queue=[];

              t=b.createElement(e);
              t.async=true;
              t.src=v;

              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s);

            }(
              window,
              document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            fbq('init', '972178519017666');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>

        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NWGTW53Q"
            height="0" 
            width="0" 
            style={{
              display: "none",
              visibility: "hidden",
            }}
            />
        </noscript>

        <noscript>
          <img
            height="1"
            width="1"
            alt=""
            src="https://www.facebook.com/tr?id=972178519017666&ev=PageView&noscript=1"
            style={{
              position: "absolute",
              left: "-9999px",
            }}
          />
        </noscript>

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
