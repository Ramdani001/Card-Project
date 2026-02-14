import { CardData } from "@/types/CardData";
import { Box, Center, Group, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BoxCard } from "../Card/BoxCard";

export const CaseBoxCard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<CardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/cards");
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
    console.log(fetchProducts());
  }, []);

  return (
    <>
      <Box mb={30} mt={50} px={30}>
        <Center mb={20}>
          <h1 className="blue-title" data-text="CASE & BOX">
            CASE & BOX
          </h1>
        </Center>
        <Center>
          <ScrollArea scrollbars="x">
            <Group wrap="nowrap" gap="xl">
              {products
                .filter((product) => product.categories.some((cat) => cat.category.slug === "case-box"))
                .map((item) => (
                  <Box key={item.id} miw={350} className="cardHover">
                    <BoxCard data={item} />
                  </Box>
                ))}
            </Group>
          </ScrollArea>
        </Center>
      </Box>
    </>
  );
};
