"use client";

import { Carousel } from "@mantine/carousel";
import { Box, Center, Container, em, Loader, SimpleGrid } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { CardComp } from "./Card/CardComp";

export const HeroSection = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery(`(max-width: ${em(768)})`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/cards/top-three");
        const result = await response.json();
        if (result.success) setCards(result.data);
      } catch (error) {
        console.error("Gagal fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <Center py={100}>
        <Loader color="orange" size="xl" type="dots" />
      </Center>
    );

  return (
    <Box bg="gray.0" py={{ base: 40, md: 80 }}>
      <Container size="lg">
        {isMobile ? (
          <Carousel
            withIndicators
            height="100%"
            slideSize="85%"
            slideGap="md"
            initialSlide={1}
            styles={{
              indicator: {
                width: 12,
                height: 4,
                transition: "width 250ms ease",
                backgroundColor: "gray",
                "&[data-active]": {
                  width: 40,
                  backgroundColor: "black",
                },
              },
            }}
          >
            {cards.map((card) => {
              const displayImage = card.images?.find((img: any) => img.isPrimary)?.url || card.images?.[0]?.url || "";
              return (
                <Carousel.Slide key={card.id} pb={40}>
                  <CardComp name={card.name} image={displayImage} />
                </Carousel.Slide>
              );
            })}
          </Carousel>
        ) : (
          <SimpleGrid cols={3} spacing={30}>
            {cards.map((card) => {
              const displayImage = card.images?.find((img: any) => img.isPrimary)?.url || card.images?.[0]?.url || "";
              return (
                <Box key={card.id}>
                  <CardComp name={card.name} image={displayImage} />
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};
