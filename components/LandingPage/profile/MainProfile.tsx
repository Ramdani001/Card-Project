"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Box, Divider, Grid, NavLink, Paper, Stack, Tabs, Text, rem } from "@mantine/core";
import { IconReceipt2, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { HeaderSection } from "../HeaderSection";
import { PageProfile } from "./PageProfile";
import { PageTransaction } from "./PageTransaction";

type MenuType = "Profile" | "Transaction";

export const MainProfile = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>("Profile");
  const iconStyle = { width: rem(16), height: rem(16) };

  return (
    <>
      <HeaderSection cartItems={[] as CartItemDto[]} />

      <Box px={{ base: 15, md: 30 }}>
        <Box hiddenFrom="md" mt="md">
          <Tabs value={activeMenu} onChange={(value) => setActiveMenu(value as MenuType)} variant="pills" radius="xl">
            <Tabs.List grow>
              <Tabs.Tab value="Profile" leftSection={<IconUser style={iconStyle} />}>
                Profile
              </Tabs.Tab>
              <Tabs.Tab value="Transaction" leftSection={<IconReceipt2 style={iconStyle} />}>
                Transaction
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Box>

        <Grid mt={20}>
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <Paper p="md" radius="xs" withBorder style={{ top: 20 }}>
              <Text fw={700} mb="md" size="lg">
                Account
              </Text>
              <Stack gap={4}>
                <NavLink
                  label="Profile"
                  active={activeMenu === "Profile"}
                  onClick={() => setActiveMenu("Profile")}
                  variant="filled"
                  color="blue"
                  leftSection={<IconUser size={18} />}
                />
                <NavLink
                  label="Transaction"
                  active={activeMenu === "Transaction"}
                  onClick={() => setActiveMenu("Transaction")}
                  variant="filled"
                  color="blue"
                  leftSection={<IconReceipt2 size={18} />}
                />
              </Stack>
              <Divider my="md" />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Box mih={400}>{activeMenu === "Profile" ? <PageProfile /> : <PageTransaction />}</Box>
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
};
