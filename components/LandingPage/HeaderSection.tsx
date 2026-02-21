"use client";

import { CartItemDto } from "@/types/CartItemDto";
import { ActionIcon, Avatar, Box, Burger, Button, Container, Group, Indicator, Menu, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLayoutDashboard, IconLogin, IconLogout, IconReceipt2, IconShoppingCart, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface HeaderSectionProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  cartItems: CartItemDto[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const HeaderSection = ({ cartItems, setIsDrawerOpen, cartItemCount, onOpenCart }: HeaderSectionProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const totalItems = cartItemCount !== undefined ? cartItemCount : cartItems.length;

  const handleOpenCart = () => {
    if (onOpenCart) onOpenCart();
    else setIsDrawerOpen(true);
  };

  return (
    <>
      <Box
        component="header"
        py="md"
        bg="white"
        style={{ borderBottom: "1px solid #e9ecef", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 15px rgba(0,0,0,0.05)" }}
      >
        <Container size="xl">
          <Group justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
              <Title
                order={3}
                style={{ fontFamily: "Impact, sans-serif", letterSpacing: 1, color: "#212529", cursor: "pointer" }}
                onClick={() => router.push("/")}
              >
                DEV
                <Text span c="blue" inherit>
                  CARD
                </Text>
              </Title>
            </Group>

            <Box visibleFrom="md">
              <Container size="xl">
                <Group gap={0}>
                  {["New Arrivals", "Single Cards", "Sealed Products", "Accessories", "Sale"].map((item) => (
                    <Menu key={item} trigger="hover" openDelay={100} closeDelay={200}>
                      <Menu.Target>
                        <Box
                          px="lg"
                          py="sm"
                          style={{ cursor: "pointer", transition: "background 0.2s", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#004494")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          className="textHov"
                        >
                          <Group gap={4}>
                            <Text size="sm" fw={700} style={{ textTransform: "uppercase" }} className="textHov2">
                              {item}
                            </Text>
                            <IconChevronDown size={14} style={{ opacity: 0.8 }} />
                          </Group>
                        </Box>
                      </Menu.Target>
                      <Menu.Dropdown style={{ borderRadius: 0, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <Menu.Item fw={600}>View All {item}</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item>Top Rated</Menu.Item>
                        <Menu.Item>Trending Now</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  ))}
                </Group>
              </Container>
            </Box>

            <Group gap="lg">
              {status === "authenticated" ? (
                <Menu shadow="md" width={220} trigger="hover" openDelay={100} closeDelay={400} position="bottom-end">
                  <Menu.Target>
                    <Group gap={8} style={{ cursor: "pointer", lineHeight: 1 }}>
                      <Avatar color="blue" radius="xl" size="sm" src={session?.user.avatar}>
                        {(session?.user?.name?.[0] || "U").toUpperCase()}
                      </Avatar>

                      <Box visibleFrom="xs">
                        <Text size="xs" c="dimmed" lh={1.2}>
                          Hello,
                        </Text>

                        <Text size="sm" fw={700} c="dark" lh={1.2}>
                          {session?.user?.name || "User"}
                        </Text>

                        <Text size="xs" c="dimmed" truncate="end" maw={140} lh={1.2}>
                          {session?.user?.email}
                        </Text>
                      </Box>
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>My Account</Menu.Label>
                    <Menu.Item leftSection={<IconUser size={14} />} onClick={() => router.push("/profile")}>
                      Profile
                    </Menu.Item>
                    <Menu.Item leftSection={<IconReceipt2 size={14} />} onClick={() => router.push("/transactions")}>
                      My Transactions
                    </Menu.Item>

                    {(session?.user as any)?.role === "Administrator" && (
                      <>
                        <Menu.Divider />
                        <Menu.Label>Admin Area</Menu.Label>
                        <Menu.Item leftSection={<IconLayoutDashboard size={14} />} onClick={() => router.push("/dashboard/main")} color="blue">
                          Dashboard
                        </Menu.Item>
                      </>
                    )}

                    <Menu.Divider />

                    <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => signOut({ callbackUrl: "/" })}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button variant="subtle" color="dark" leftSection={<IconLogin size={18} />} onClick={() => router.push("/login")} size="xs">
                  Login / Register
                </Button>
              )}

              <Indicator label={totalItems} size={16} color="red" offset={4} disabled={totalItems === 0}>
                <ActionIcon variant="transparent" color="dark" size="xl" onClick={handleOpenCart}>
                  <IconShoppingCart size={26} stroke={1.5} />
                </ActionIcon>
              </Indicator>
            </Group>
          </Group>
        </Container>
      </Box>
    </>
  );
};
