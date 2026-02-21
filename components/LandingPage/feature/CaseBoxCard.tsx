import { CardDto } from "@/types/CardDto";
import { Box, Center, Group, ScrollArea, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { BoxCard } from "../Card/BoxCard";

export const CaseBoxCard = () => {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const category = encodeURIComponent("Case & Box");
        const res = await fetch(`/api/cards?categories=${category}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetch cards:", error);
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
    <Box mb={30} mt={50} px={30}>
      <Center mb={20}>
        <h1 className="blue-title" data-text="CASE & BOX">
          CASE & BOX
        </h1>
      </Center>

      <ScrollArea scrollbars="x" w="100%" pb="md">
        <Group wrap="nowrap" gap="xl" justify="center" miw="100%" style={{ display: "inline-flex" }}>
          {loadingProducts ? (
            [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((item) => (
              <Box key={item.id} miw={350} className="cardHover">
                <BoxCard data={item} />
              </Box>
            ))
          ) : (
            <Skeleton h={50} w="100%" visible={false}>
              <Center>
                <p>No products found in this category.</p>
              </Center>
            </Skeleton>
          )}
        </Group>
      </ScrollArea>
    </Box>
  );
};
