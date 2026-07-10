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
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronRight, IconMenu2, IconSearch, IconShoppingCart, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ProfileTopbar } from "../layout/ProfileTopbar";
import { CartSection } from "./Cart/CartSection";

interface RecursiveMenuItemProps {
  item: MenuDto;
  allMenus: MenuDto[];
  router: ReturnType<typeof useRouter>;
  isRoot?: boolean;
}

const RecursiveMenuItem = ({ item, allMenus, router, isRoot = false }: RecursiveMenuItemProps) => {
  const children = allMenus.filter((sub) => String(sub.parentId) === String(item.id));
  const hasChild = children.length > 0;

  const MenuTarget = isRoot ? (
    <UnstyledButton className="nav-link" onClick={() => !hasChild && item.url && router.push(item.url)}>
      <Text size="xs" fw={800} lts={1} tt="uppercase" c="gray.7">
        {item.label}
      </Text>
      {hasChild && <IconChevronDown size={14} stroke={3} style={{ opacity: 0.5 }} />}
    </UnstyledButton>
  ) : (
    <Menu.Item
      fw={600}
      fz="sm"
      onClick={() => !hasChild && item.url && router.push(item.url)}
      closeMenuOnClick={!hasChild}
      rightSection={hasChild ? <IconChevronRight size={14} stroke={3} style={{ opacity: 0.5 }} /> : null}
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
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }
            : {
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              },
        }}
      >
        {children.map((sub) => (
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
        py={rem(11)}
        className="mobile-nav-item"
        style={{ borderRadius: rem(8) }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Text
            size={depth === 0 ? "sm" : "xs"}
            fw={depth === 0 ? 700 : 500}
            tt={depth === 0 ? "uppercase" : "none"}
            lts={depth === 0 ? 0.5 : 0}
            c={depth === 0 ? "gray.8" : "gray.6"}
          >
            {item.label}
          </Text>
          {hasChild && (
            <IconChevronDown
              size={14}
              stroke={2.5}
              color="var(--mantine-color-gray-5)"
              style={{
                transform: opened ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            />
          )}
        </Group>
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

interface MobileSearchProps {
  router: ReturnType<typeof useRouter>;
  closeDrawer: () => void;
}

const MobileSearch = ({ router, closeDrawer }: MobileSearchProps) => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/Catalog?search=${encodeURIComponent(search)}`);
      closeDrawer();
    }
  };

  return (
    <Box px="md" pb="sm">
      <TextInput
        placeholder="Search..."
        leftSection={<IconSearch size={15} />}
        radius="sm"
        size="sm"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        rightSection={
          search ? (
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setSearch("")}>
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
      />
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
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
  const cartCount = cartItems?.length ?? 0;

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
        /* Desktop nav link */
        .nav-link {
          padding: ${rem(8)} ${rem(12)};
          cursor: pointer;
          transition: color 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          border-radius: 6px;
        }
        .nav-link:hover .mantine-Text-root {
          color: var(--mantine-color-blue-6) !important;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: var(--mantine-color-blue-6);
          transition: width 0.25s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 60%;
        }

        /* Mobile nav item hover */
        .mobile-nav-item:hover {
          background: var(--mantine-color-blue-0) !important;
        }

        /* Search expand animation */
        .search-expand {
          transition: width 0.25s ease;
        }
      `}</style>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="300px"
        padding={0}
        withCloseButton={false}
        hiddenFrom="md"
        styles={{
          body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" },
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
            <Image src="https://is3.cloudhost.id/tokokartu/Production/toko-kartu-logo.png" alt="Toko Kartu Logo" w={48} />
          </Link>
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={closeDrawer} aria-label="Tutup menu">
            <IconX size={18} stroke={1.5} />
          </ActionIcon>
        </Group>

        <Box pt="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)", flexShrink: 0 }}>
          <MobileSearch router={router} closeDrawer={closeDrawer} />
        </Box>

        <ScrollArea flex={1} px="xs" py="sm">
          <Stack gap={2}>
            {rootMenus.map((item) => (
              <MobileMenuItem key={item.id} item={item} allMenus={menus} router={router} closeDrawer={closeDrawer} />
            ))}
          </Stack>
        </ScrollArea>

        <Box
          px="md"
          py="sm"
          style={{
            borderTop: "1px solid var(--mantine-color-gray-2)",
            flexShrink: 0,
          }}
        >
          <ProfileTopbar />
        </Box>
      </Drawer>

      <Box
        component="header"
        bg="white"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          position: "sticky",
          top: 0,
          zIndex: 1,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <Container fluid h={rem(64)} px={{ base: rem(12), sm: rem(20) }}>
          <Group justify="space-between" h="100%" wrap="nowrap" gap="xs">
            <Group gap="xs" style={{ flexShrink: 0 }}>
              <ActionIcon variant="subtle" color="gray.7" size="lg" hiddenFrom="md" onClick={openDrawer} aria-label="Buka menu">
                <IconMenu2 size={22} stroke={1.5} />
              </ActionIcon>

              <Link href="/" passHref style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                <Image src="https://is3.cloudhost.id/tokokartu/Production/toko-kartu-logo.png" alt="Toko Kartu Logo" w={{ base: 48, sm: 56 }} />
              </Link>
            </Group>

            <Group gap={0} visibleFrom="md" h="100%" style={{ flex: 1, justifyContent: "center", overflow: "hidden" }}>
              {rootMenus.map((item) => (
                <RecursiveMenuItem key={item.id} item={item} allMenus={menus} router={router} isRoot />
              ))}
            </Group>

            <Group gap="sm" style={{ flexShrink: 0 }} wrap="nowrap">
              <TextInput
                visibleFrom="md"
                ref={searchRef}
                placeholder="Search..."
                leftSection={<IconSearch size={15} />}
                radius="sm"
                size="sm"
                className="search-expand"
                style={{ width: searchFocused ? rem(260) : rem(200) }}
                value={search}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={(e) => setSearch(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    const targetUrl = `/Catalog?search=${encodeURIComponent(search)}`;
                    const currentUrl = window.location.pathname + window.location.search;

                    if (currentUrl === targetUrl) {
                      router.refresh();
                      window.location.reload();
                    } else {
                      router.push(targetUrl);
                    }
                  }
                }}
                rightSection={
                  search ? (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        searchRef.current?.focus();
                      }}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  ) : null
                }
              />
              <ActionIcon hiddenFrom="md" variant="subtle" color="gray.7" size="lg" aria-label="Cari" onClick={openDrawer}>
                <IconSearch size={20} stroke={1.5} />
              </ActionIcon>

              <Divider orientation="vertical" h={24} my="auto" />

              {cartItems && !loadingCart ? (
                <Indicator label={cartCount > 99 ? "99+" : cartCount} size={16} color="red.6" offset={4} disabled={cartCount === 0} withBorder>
                  <ActionIcon
                    variant="subtle"
                    color="gray.7"
                    size="lg"
                    onClick={() => setIsCartOpen(true)}
                    aria-label={`Keranjang${cartCount ? `, ${cartCount} item` : ""}`}
                  >
                    <IconShoppingCart size={22} stroke={1.5} />
                  </ActionIcon>
                </Indicator>
              ) : (
                <ActionIcon variant="subtle" color="gray.7" size="lg" onClick={() => setIsCartOpen(true)} aria-label="Keranjang">
                  <IconShoppingCart size={22} stroke={1.5} />
                </ActionIcon>
              )}

              <Box visibleFrom="md">
                <Divider orientation="vertical" h={24} my="auto" />
              </Box>
              <Box visibleFrom="md">
                <ProfileTopbar />
              </Box>
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
