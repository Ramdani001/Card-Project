"use client";

import { CardData } from "@/types/CardData";
import { Box, Button, Center, Group, ScrollArea, Text, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardSingle } from "../Card/CardSingle";

export const SingleCard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<CardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/cards?categories=Single Card");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetch cards:", error);
        notifications.show({ title: "Error", message: "Gagal mengambil data produk.", color: "red" });
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
    <>
      <Box mb={30} mt={50} px={30}>
        <Center mb={20}>
          <h1>FEATURED SINGLE CARD</h1>
        </Center>

        <Center>
          <ScrollArea scrollbars="x" w="100%">
            <Group wrap="nowrap" gap="xl" pb="md" justify="center" style={{ minWidth: "max-content", margin: "0 auto" }}>
              {loadingProducts
                ? [...Array(5)].map((_, i) => <CardSkeleton key={i} />)
                : products.map((item) => (
                    <Box key={item.id} miw={250} className="cardHover">
                      <CardSingle data={item} />
                    </Box>
                  ))}
            </Group>
          </ScrollArea>
        </Center>

        <Center>
          <Button py={10} px={30} bg={"#0035d4"} mt={20} onClick={() => router.push("/Catalog")} disabled={loadingProducts}>
            <Text size="xl">More</Text>
          </Button>
        </Center>
      </Box>
    </>
  );
};
