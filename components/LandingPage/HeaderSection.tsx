"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { MenuDto } from "@/types/dtos/MenuDto";
import {
  ActionIcon,
  Box,
  Center,
  Collapse,
  Container,
  Divider,
  Drawer,
  Group,
  Image,
  Indicator,
  Loader,
  Menu,
  rem,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronRight, IconMenu2, IconShoppingCart, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ProfileTopbar } from "../layout/ProfileTopbar";
import { CartSection } from "./Cart/CartSection";

interface RecursiveMenuItemProps {
  item: MenuDto;
  allMenus: MenuDto[];
  router: ReturnType<typeof useRouter>;
  isRoot?: boolean;
}

const RecursiveMenuItem = ({ item, allMenus, router, isRoot = false }: RecursiveMenuItemProps) => {
  const menuChild = allMenus.filter((sub) => String(sub.parentId) === String(item.id));
  const hasChild = menuChild.length > 0;

  const MenuTarget = isRoot ? (
    <UnstyledButton
      className="nav-link"
      onClick={() => !hasChild && item.url && router.push(item.url)}
      style={{ display: "flex", alignItems: "center", gap: "4px" }}
    >
      <Text size="xs" fw={800} lts={1} tt="uppercase" c="gray.7">
        {item.label}
      </Text>
      {hasChild && <IconChevronDown size={14} stroke={3} style={{ opacity: 0.5 }} />}
    </UnstyledButton>
  ) : (
    <Menu.Item
      fw={600}
      onClick={() => !hasChild && item.url && router.push(item.url)}
      closeMenuOnClick={!hasChild}
      rightSection={hasChild && <IconChevronRight size={14} stroke={3} style={{ opacity: 0.5 }} />}
    >
      {item.label}
    </Menu.Item>
  );

  if (!hasChild) {
    return isRoot ? <Box key={item.id}>{MenuTarget}</Box> : MenuTarget;
  }

  return (
    <Menu
      key={item.id}
      trigger="hover"
      openDelay={50}
      closeDelay={150}
      withinPortal={isRoot}
      position={isRoot ? "bottom-start" : "right-start"}
      width={200}
    >
      <Menu.Target>{MenuTarget}</Menu.Target>
      <Menu.Dropdown
        styles={{
          dropdown: isRoot
            ? {
                borderRadius: "0 0 8px 8px",
                borderTop: "2px solid var(--mantine-color-blue-6)",
              }
            : { borderRadius: "8px" },
        }}
      >
        {menuChild.map((sub) => (
          <RecursiveMenuItem key={sub.id} item={sub} allMenus={allMenus} router={router} isRoot={false} />
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

interface MobileMenuItemProps {
  item: MenuDto;
  allMenus: MenuDto[];
  router: ReturnType<typeof useRouter>;
  closeDrawer: () => void;
  depth?: number;
}

const MobileMenuItem = ({ item, allMenus, router, closeDrawer, depth = 0 }: MobileMenuItemProps) => {
  const [opened, setOpened] = useState(false);
  const children = allMenus.filter((sub) => String(sub.parentId) === String(item.id));
  const hasChild = children.length > 0;

  const handleClick = () => {
    if (hasChild) {
      setOpened((o) => !o);
    } else if (item.url) {
      router.push(item.url);
      closeDrawer();
    }
  };

  return (
    <Box>
      <UnstyledButton
        onClick={handleClick}
        w="100%"
        px={rem(16 + depth * 12)}
        py={rem(12)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: rem(8),
          transition: "background 0.15s ease",
        }}
        styles={{
          root: {
            "&:hover": {
              background: "var(--mantine-color-blue-0)",
            },
          },
        }}
      >
        <Text
          size={depth === 0 ? "sm" : "xs"}
          fw={depth === 0 ? 700 : 600}
          tt={depth === 0 ? "uppercase" : "none"}
          lts={depth === 0 ? 0.5 : 0}
          c={depth === 0 ? "gray.8" : "gray.7"}
        >
          {item.label}
        </Text>
        {hasChild && (
          <IconChevronDown
            size={14}
            stroke={2.5}
            style={{
              opacity: 0.5,
              transform: opened ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </UnstyledButton>

      {hasChild && (
        <Collapse expanded={opened}>
          <Stack gap={0} pl={rem(8)}>
            {children.map((child) => (
              <MobileMenuItem key={child.id} item={child} allMenus={allMenus} router={router} closeDrawer={closeDrawer} depth={depth + 1} />
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
};

interface HeaderSectionProps {
  cartItems?: CartItemDto[];
  loadingCart?: boolean;
  setCartItems?: Dispatch<SetStateAction<CartItemDto[]>>;
}

export const HeaderSection = ({ cartItems, loadingCart, setCartItems }: HeaderSectionProps) => {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

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

  const rootMenus = menus.filter((m) => !m.parentId);

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

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="280px"
        padding={0}
        withCloseButton={false}
        hiddenFrom="md"
        styles={{
          body: { padding: 0, height: "100%" },
          content: { display: "flex", flexDirection: "column" },
        }}
      >
        <Group
          justify="space-between"
          align="center"
          px="md"
          py="sm"
          style={{
            borderBottom: "1px solid var(--mantine-color-gray-2)",
            flexShrink: 0,
          }}
        >
          <Link href="/" passHref style={{ textDecoration: "none", display: "inline-block" }} onClick={closeDrawer}>
            <Image src="/toko-kartu-logo.png" alt="Toko Kartu Logo" w={48} />
          </Link>
          <ActionIcon variant="subtle" color="gray.6" size="lg" onClick={closeDrawer}>
            <IconX size={20} stroke={1.5} />
          </ActionIcon>
        </Group>

        <ScrollArea flex={1} px="xs" py="sm">
          <Stack gap={2}>
            {rootMenus.map((item) => (
              <MobileMenuItem key={item.id} item={item} allMenus={menus} router={router} closeDrawer={closeDrawer} />
            ))}
          </Stack>
        </ScrollArea>
      </Drawer>

      <Box
        component="header"
        bg="white"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          position: "sticky",
          top: 0,
          zIndex: 200,
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Container fluid h={rem(70)} mx={20}>
          <Group justify="space-between" h="100%" wrap="nowrap">
            <Group>
              <ActionIcon variant="subtle" color="gray.7" size="lg" hiddenFrom="md" onClick={openDrawer}>
                <IconMenu2 size={22} stroke={1.5} />
              </ActionIcon>

              <Link href="/" passHref style={{ textDecoration: "none", display: "inline-block" }}>
                <Image src="/toko-kartu-logo.png" alt="Toko Kartu Logo" w={60} />
              </Link>
            </Group>

            <Group gap={0} visibleFrom="md" h="100%" style={{ flex: 1, justifyContent: "center" }}>
              {rootMenus.map((item) => {
                const children = menus.filter((sub) => String(sub.parentId) === String(item.id));
                const hasChild = children.length > 0;

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
                    <Menu.Dropdown
                      styles={{
                        dropdown: {
                          borderRadius: "0 0 8px 8px",
                          borderTop: "2px solid var(--mantine-color-blue-6)",
                        },
                      }}
                    >
                      {children.map((sub) => (
                        <RecursiveMenuItem key={sub.id} item={sub} allMenus={menus} router={router} isRoot={false} />
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                );
              })}
            </Group>

            <Group gap="sm" style={{ flexShrink: 0 }}>
              {cartItems && !loadingCart && (
                <Indicator label={cartItems.length} size={16} color="red.6" offset={4} disabled={cartItems.length === 0} withBorder>
                  <ActionIcon variant="subtle" color="gray.7" size="lg" onClick={() => setIsCartOpen(true)}>
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
          isDrawerOpen={isCartOpen}
          setIsDrawerOpen={setIsCartOpen}
          loadingCart={loadingCart || false}
          setCartItems={setCartItems}
        />
      )}
    </>
  );
};
