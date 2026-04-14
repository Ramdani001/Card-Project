"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { MenuDto } from "@/types/dtos/MenuDto";
import { ActionIcon, Box, Center, Container, Divider, Group, Indicator, Loader, Menu, rem, Text, Title, UnstyledButton } from "@mantine/core";
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

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/menus?isDashboardMenu=false");
        const json = await res.json();
        if (json.success) setMenus(json.data);
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
      <Center h={rem(70)} bg="white">
        <Loader color="blue" size="sm" type="dots" />
      </Center>
    );
  }

  return (
    <>
      <style jsx global>{`
        .nav-link {
          padding: ${rem(12)} ${rem(16)};
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link:hover {
          color: var(--mantine-color-blue-6) !important;
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
          width: 60%;
        }
      `}</style>

      <Box
        component="header"
        bg="white"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          position: "sticky",
          top: 0,
          zIndex: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Container size="xl" h={rem(70)}>
          <Group justify="space-between" h="100%" wrap="nowrap">
            <Title
              order={3}
              style={{ fontFamily: "Impact, sans-serif", letterSpacing: 1, cursor: "pointer", flexShrink: 0 }}
              onClick={() => router.push("/")}
            >
              TOKO{" "}
              <Text span c="blue.6" inherit>
                KARTU
              </Text>
            </Title>

            <Group gap={0} visibleFrom="md" h="100%">
              {menus
                .filter((m) => !m.parentId)
                .map((item) => {
                  const menuChild = menus.filter((sub) => String(sub.parentId) === String(item.id));
                  const hasChild = menuChild.length > 0;

                  const MenuTarget = (
                    <UnstyledButton className="nav-link" onClick={() => !hasChild && item.url && router.push(item.url)}>
                      <Text size="xs" fw={800} lts={1} tt="uppercase" c="gray.7">
                        {item.label}
                      </Text>
                      {hasChild && <IconChevronDown size={14} stroke={3} style={{ opacity: 0.5 }} />}
                    </UnstyledButton>
                  );

                  if (!hasChild) return <Box key={item.id}>{MenuTarget}</Box>;

                  return (
                    <Menu key={item.id} trigger="hover" openDelay={50} closeDelay={150} withinPortal width={200}>
                      <Menu.Target>{MenuTarget}</Menu.Target>
                      <Menu.Dropdown styles={{ dropdown: { borderRadius: "0 0 8px 8px", borderTop: "2px solid var(--mantine-color-blue-6)" } }}>
                        {menuChild.map((sub) => (
                          <Menu.Item key={sub.id} fw={600} onClick={() => sub.url && router.push(sub.url)}>
                            {sub.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  );
                })}
            </Group>

            <Group gap="sm" style={{ flexShrink: 0 }}>
              {cartItems && !loadingCart && (
                <Indicator label={cartItems.length} size={16} color="red.6" offset={4} disabled={cartItems.length === 0} withBorder>
                  <ActionIcon variant="subtle" color="gray.7" size="lg" onClick={() => setIsDrawerOpen(true)}>
                    <IconShoppingCart size={24} stroke={1.5} />
                  </ActionIcon>
                </Indicator>
              )}

              <Divider orientation="vertical" h={25} my="auto" visibleFrom="xs" />

              <ProfileTopbar />
            </Group>
          </Group>
        </Container>
      </Box>

      {cartItems && setCartItems && (
        <CartSection
          cartItems={cartItems}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          loadingCart={loadingCart || false}
          setCartItems={setCartItems}
        />
      )}
    </>
  );
};
