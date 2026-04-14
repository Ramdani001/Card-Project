"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { Carousel } from "@mantine/carousel";
import { Box, Center, Container, Skeleton, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { CardSingle } from "../Card/CardSingle";

export const CaseBoxCard = () => {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const autoplay = useRef(Autoplay({ delay: 3000 }));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({ categories: "Case & Box" });
        const res = await fetch(`/api/cards?${params.toString()}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch {
        notifications.show({
          title: "Error",
          message: "Gagal mengambil data produk.",
          color: "red",
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const CardSkeleton = () => (
    <Box miw={350}>
      <Skeleton h={250} radius="md" mb="sm" />
      <Skeleton h={20} radius="xl" mb="xs" w="70%" />
      <Skeleton h={20} radius="xl" w="40%" />
    </Box>
  );

  return (
    <Container size={"xl"} my={50}>
      <Center mb={30}>
        <Title order={2} className="blue-title" data-text="CASE & BOX" style={{ letterSpacing: "2px" }}>
          CASE & BOX
        </Title>
      </Center>

      <Carousel
        slideSize={250}
        slideGap="md"
        controlSize={40}
        withControls={products.length > 0}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={() => autoplay.current.play()}
        emblaOptions={{
          loop: true,
          dragFree: false,
          align: "center",
        }}
      >
        {loadingProducts
          ? Array.from({ length: 5 }).map((_, i) => (
              <Carousel.Slide key={i}>
                <CardSkeleton />
              </Carousel.Slide>
            ))
          : products.map((item) => (
              <Carousel.Slide key={item.id}>
                <CardSingle data={item} />
              </Carousel.Slide>
            ))}
      </Carousel>
    </Container>
  );
};
