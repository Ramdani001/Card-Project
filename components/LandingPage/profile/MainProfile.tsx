import { CardDto } from "@/types/dtos/CardDto";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Box, Divider, Grid, Group, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSection } from "../HeaderSection";
import { PageProfile } from "./PageProfile";
import { PageTransaction } from "./PageTransaction";

export const MainProfile = () => {
  const router = useRouter();
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cartItems, setCartItems] = useState<CartItemDto[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [menu, setmenu] = useState("Profile");

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
  }, []);

  const handleMenu = (e: string) => {
    setmenu(e);
  };

  return (
    <>
      <Box mb={30} mt={50} px={30}>
        <HeaderSection search={search} setSearch={setSearch} cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />
        <Grid gutter="xl" mt={10}>
          {/* Sidebar Filter */}
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
              <Group justify="space-between" mb="md"></Group>

              <Stack gap="xs">
                <Text size="sm" fw={700} mb={4} onClick={() => handleMenu("Profile")} style={{ cursor: "pointer" }}>
                  Profile
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={700} mb={4} onClick={() => handleMenu("Transaction")} style={{ cursor: "pointer" }}>
                  Transaction
                </Text>
              </Stack>

              <Divider my="md" />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            {menu === "Profile" ? <PageProfile /> : ""}
            {menu === "Transaction" ? <PageTransaction /> : ""}
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
};
