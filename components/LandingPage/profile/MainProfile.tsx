"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Box, Divider, Grid, NavLink, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { HeaderSection } from "../HeaderSection";
import { PageProfile } from "./PageProfile";
import { PageTransaction } from "./PageTransaction";

type MenuType = "Profile" | "Transaction";

export const MainProfile = () => {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemDto[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<MenuType>("Profile");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch("/api/cards");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
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

  const renderContent = () => {
    switch (activeMenu) {
      case "Profile":
        return <PageProfile />;
      case "Transaction":
        return <PageTransaction />;
      default:
        return <PageProfile />;
    }
  };

  return (
    <Box px={30}>
      <HeaderSection search={search} setSearch={setSearch} cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />

      <Grid gutter="xl" mt={10}>
        <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
          <Paper p="md" radius="sm" withBorder>
            <Text fw={700} mb="md" size="lg">
              Account
            </Text>
            <Stack gap={4}>
              <NavLink label="Profile" active={activeMenu === "Profile"} onClick={() => setActiveMenu("Profile")} variant="filled" color="blue" />
              <NavLink
                label="Transaction"
                active={activeMenu === "Transaction"}
                onClick={() => setActiveMenu("Transaction")}
                variant="filled"
                color="blue"
              />
            </Stack>
            <Divider my="md" />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 9 }}>
          <Box mih={400}>{renderContent()}</Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
};
