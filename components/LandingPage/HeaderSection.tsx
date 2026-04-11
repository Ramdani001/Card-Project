"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { MenuDto } from "@/types/dtos/MenuDto";
import { ActionIcon, Box, Center, Container, Group, Indicator, Loader, Menu, rem, Text, Title, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconShoppingCart } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ProfileTopbar } from "../layout/ProfileTopbar";
import { CartSection } from "./CartSection";

interface HeaderSectionProps {
  cartItems?: CartItemDto[];
  loadingCart?: boolean;
  setCartItems?: Dispatch<SetStateAction<CartItemDto[]>>;
}

export const HeaderSection = ({ cartItems, loadingCart, setCartItems }: HeaderSectionProps) => {
  const router = useRouter();

  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenCart = () => setIsDrawerOpen(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/menus?isDashboardMenu=false");
        const json = await res.json();
        if (json.success) {
          setMenus(json.data);
        }
      } catch (error) {
        console.error("Gagal ambil menu:", error);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenus();
  }, []);

  if (loadingMenu) {
    return (
      <Center h="100vh">
        <Loader color="blue" size="xl" type="dots" />
      </Center>
    );
  }

  return (
    <>
      <style jsx global>{`
        .nav-link {
          padding: ${rem(12)} ${rem(20)};
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link:hover {
          background-color: #f8f9fa;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: var(--mantine-color-blue-6);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 40%;
        }
      `}</style>

      <Box
        component="header"
        bg="white"
        style={{
          borderBottom: "1px solid #f1f3f5",
          position: "sticky",
          top: 0,
          zIndex: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Container fluid h={rem(70)} display="flex" style={{ alignItems: "center" }}>
          <Group justify="space-between" w="100%">
            <Title order={3} style={{ fontFamily: "Impact, sans-serif", letterSpacing: 1, cursor: "pointer" }} onClick={() => router.push("/")}>
              TOKO
              <Text span c="blue" inherit>
                KARTU
              </Text>
            </Title>

            <Group gap={0} visibleFrom="md">
              {menus
                .filter((m) => !m.parentId)
                .map((item) => {
                  const menuChild = menus.filter((sub) => String(sub.parentId) === String(item.id));
                  const hasChild = menuChild.length > 0;

                  const MenuContent = (
                    <UnstyledButton className="nav-link" onClick={() => router.push(item.url || "#")}>
                      <Text size="xs" fw={800} lts={1} tt="uppercase" c="gray.8">
                        {item.label}
                      </Text>
                      {hasChild && <IconChevronDown size={14} stroke={3} style={{ opacity: 0.4 }} />}
                    </UnstyledButton>
                  );

                  if (!hasChild) {
                    return <Box key={item.id}>{MenuContent}</Box>;
                  }

                  return (
                    <Menu key={item.id} trigger="hover" openDelay={50} closeDelay={150} withinPortal offset={0} width={220}>
                      <Menu.Target>{MenuContent}</Menu.Target>

                      <Menu.Dropdown style={{ borderRadius: 0, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 1001 }}>
                        {menuChild.map((sub) => (
                          <Menu.Item key={sub.id} fw={600} onClick={() => router.push(sub.url || "#")}>
                            {sub.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  );
                })}
            </Group>

            <Group gap="lg">
              {cartItems && !loadingCart && (
                <Indicator label={cartItems.length} size={18} color="blue" offset={4} disabled={cartItems.length === 0} withBorder>
                  <ActionIcon variant="subtle" color="dark" size="lg" onClick={handleOpenCart}>
                    <IconShoppingCart size={24} stroke={1.5} />
                  </ActionIcon>
                </Indicator>
              )}

              <ProfileTopbar />
            </Group>
          </Group>
        </Container>
      </Box>

      {cartItems != null && loadingCart != null && setCartItems != null && (
        <CartSection
          cartItems={cartItems}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          loadingCart={loadingCart}
          setCartItems={setCartItems}
        />
      )}
    </>
  );
};
