"use client";

import { CaseBoxCard } from "@/components/LandingPage/feature/CaseBoxCard";
import { SingleCard } from "@/components/LandingPage/feature/SingleCard";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { PreOrder } from "@/components/LandingPage/PreOrder/PreOrder";
import { SwiperCard } from "@/components/LandingPage/swiper/SwiperCard";
import { CartItem } from "@/types/CartItem";
import { Box } from "@mantine/core";
import { useState } from "react";

export default function TcgCornerClone() {
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSection search={search} setSearch={setSearch} cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />
      <HeroSection />
      <SwiperCard />
      <SingleCard />
      <PreOrder />
      <CaseBoxCard />
    </Box>
  );
}
