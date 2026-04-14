"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { Box, Center, Container, Group, ScrollArea, Skeleton, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { CardSingle } from "../Card/CardSingle";

export const CaseBoxCard = () => {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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
    <Container fluid my={50}>
      <Center mb={30}>
        <Title order={2} className="blue-title" data-text="CASE & BOX" style={{ letterSpacing: "2px" }}>
          CASE & BOX
        </Title>
      </Center>

      <ScrollArea scrollbars="x" w="100%" pb="md" type="hover">
        <Group wrap="nowrap" gap="xl" justify={"center"}>
          {loadingProducts ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((item) => (
              <Box key={item.id} miw={250} className="cardHover">
                <CardSingle data={item} />
              </Box>
            ))
          ) : (
            <Box py={40} style={{ textAlign: "center", width: "100%" }}>
              <Text c="dimmed">No products found in this category.</Text>
            </Box>
          )}
        </Group>
      </ScrollArea>
    </Container>
  );
};
