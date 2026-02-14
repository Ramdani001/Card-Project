import { Badge, Box, Button, Card, Center, Group, Image, ScrollArea, SimpleGrid, Text} from "@mantine/core";
import { CardSingle } from "../Card/CardSingle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardData } from "@/types/CardData";
import { notifications } from "@mantine/notifications";

export const SingleCard = () => {
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
                <h1>FEATURED SINGLE CARD</h1>
            </Center>
            <Center>
                <ScrollArea
                scrollbars="x"
                >
                <Group wrap="nowrap" gap="xl">
                     {products
                        .filter((product) =>
                            product.categories.some(
                            (cat) => cat.category.slug === "single-card"
                            )
                        )
                        .map((item) => (
                            <Box key={item.id} miw={250} className="cardHover">
                            <CardSingle data={item} />
                            </Box>
                        ))
                    }

                </Group>
                </ScrollArea>

            </Center>
            <Center>
                <Button py={10} px={30} bg={"#0035d4"} mt={20} onClick={() => router.push("Catalog")}>
                    <Text size="xl">
                        More ...
                    </Text>
                </Button>
            </Center>
        </Box>
    </>
  );
};