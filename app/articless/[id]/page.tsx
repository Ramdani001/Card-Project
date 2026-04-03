"use client";

import { SinglePageArct } from "@/components/LandingPage/Article/SinglePageArct";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [cartItems, _setCartItems] = useState<CartItemDto[]>([]);
  const [_isDrawerOpen, setIsDrawerOpen] = useState(false);

  const params = useParams();
  const id = params?.id;

  if (!id || typeof id !== "string") {
    return <div>Invalid Article</div>;
  }

  return (
    <>
      <HeaderSection cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />
      <SinglePageArct articleId={id} />
    </>
  );
}
