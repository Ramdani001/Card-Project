"use client";

import { useCart } from "@/components/hooks/useCart";
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
  const { cartItems, handleAddToCart, loadingAction, loadingCart, setCartItems } = useCart();

  return (
    <Box style={{ backgroundColor: "#f7f8fb", color: "#1f2a44", minHeight: "100vh", margin: 0 }}>
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />
      <Box component="main">
        <HeroSection handleAddToCart={handleAddToCart} loadingCart={loadingAction} />
        <SwiperCard />
        <SingleCard handleAddToCart={handleAddToCart} loadingCart={loadingAction} />
        <PreOrder />
        <CaseBoxCard handleAddToCart={handleAddToCart} loadingCart={loadingAction} />
        <ArticleMain />
      </Box>
      <FooterSection />
    </Box>
  );
}
