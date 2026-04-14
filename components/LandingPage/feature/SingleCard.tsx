"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { Box, Button, Center, Container, Group, rem, ScrollArea, Skeleton, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardSingle } from "../Card/CardSingle";

export const SingleCard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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
    <Container fluid my={50}>
      <Title order={2} ta="center" mb={30} style={{ letterSpacing: "1px" }}>
        FEATURED SINGLE CARD
      </Title>

      <ScrollArea scrollbars="x" w="100%" pb="md">
        <Group wrap="nowrap" gap="xl" justify={"center"}>
          {loadingProducts
            ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            : products.map((item) => (
                <Box key={item.id} miw={250} className="cardHover">
                  <CardSingle data={item} />
                </Box>
              ))}
        </Group>
      </ScrollArea>

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
