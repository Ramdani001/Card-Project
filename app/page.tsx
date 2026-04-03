"use client";

import { ArticleMain } from "@/components/LandingPage/Article/ArticleMain";
import { CaseBoxCard } from "@/components/LandingPage/feature/CaseBoxCard";
import { SingleCard } from "@/components/LandingPage/feature/SingleCard";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { PreOrder } from "@/components/LandingPage/PreOrder/PreOrder";
import { SwiperCard } from "@/components/LandingPage/swiper/SwiperCard";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Box } from "@mantine/core";
import { useState } from "react";

export default function TcgCornerClone() {
  const [cartItems, _setCartItems] = useState<CartItemDto[]>([]);
  const [_isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Box style={{ backgroundColor: "#f7f8fb", color: "#1f2a44", minHeight: "100vh" }}>
      <HeaderSection cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />
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
