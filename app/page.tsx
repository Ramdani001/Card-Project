"use client";

import { ArticleMain } from "@/components/LandingPage/Article/ArticleMain";
import { CaseBoxCard } from "@/components/LandingPage/feature/CaseBoxCard";
import { SingleCard } from "@/components/LandingPage/feature/SingleCard";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { PreOrder } from "@/components/LandingPage/PreOrder/PreOrder";
import { SwiperCard } from "@/components/LandingPage/swiper/SwiperCard";
import { Box } from "@mantine/core";

export default function TcgCornerClone() {
  return (
    <Box style={{ backgroundColor: "#f7f8fb", color: "#1f2a44", minHeight: "100vh" }}>
      <HeaderSection />
      <Box component="main">
        <HeroSection />
        <SwiperCard />
        <SingleCard />
        <PreOrder />
        <CaseBoxCard />
        <ArticleMain />
      </Box>
      <FooterSection />
    </Box>
  );
}
