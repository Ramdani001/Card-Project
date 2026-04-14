"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { Carousel } from "@mantine/carousel";
import { Box, Button, Center, Container, rem, Skeleton, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CardSingle } from "../Card/CardSingle";
import Autoplay from "embla-carousel-autoplay";

export const SingleCard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const autoplay = useRef(Autoplay({ delay: 3000 }));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/cards?categories=Single Card");
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
    <Box miw={250}>
      <Skeleton h={350} radius="md" mb="sm" />
      <Skeleton h={20} radius="xl" mb="xs" w="85%" />
      <Skeleton h={20} radius="xl" w="50%" />
    </Box>
  );

  return (
    <Container size={"xl"} my={50}>
      <Title order={2} ta="center" mb="xl" c="blue.9">
        FEATURED SINGLE CARD
      </Title>

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

      <Center mt={40}>
        <Button
          variant="outline"
          color="dark"
          size="sm"
          radius="xs"
          styles={{
            root: {
              borderWidth: rem(1.5),
              fontWeight: 600,
              transition: "transform 0.2s ease",
              "&:active": { transform: "scale(0.95)" },
            },
          }}
          onClick={() => router.push("/Catalog")}
          disabled={loadingProducts}
        >
          View More
        </Button>
      </Center>
    </Container>
  );
};
