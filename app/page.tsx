"use client";

import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
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
    </Box>
  );
}