import { CartItem } from "@/types/CartItem";
import { ActionIcon, Box, Burger, Button, Container, Divider, Group, Indicator, Menu, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLayoutDashboard, IconLogin, IconLogout, IconSearch, IconShoppingCart, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface HeaderSectionProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  cartItems: CartItem[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export const HeaderSection = ({ search, setSearch, cartItems, setIsDrawerOpen }: HeaderSectionProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <Box bg="#212529" c="gray.4" py={8} style={{ fontSize: 12 }}>
        <Container size="xl">
          <Group justify="space-between">
            <Text size="xs">Indonesia&apos;s Premier TCG Store | 100% Authentic Cards</Text>
            <Group gap="md" visibleFrom="xs">
              <Text size="xs" style={{ cursor: "pointer" }} c="dimmed">
                Help Center
              </Text>
              <Divider orientation="vertical" color="gray.7" />
              <Text size="xs" style={{ cursor: "pointer" }} c="dimmed">
                Track Order
              </Text>
            </Group>
          </Group>
        </Container>
      </Box>

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
              <Title order={3} style={{ fontFamily: "Impact, sans-serif", letterSpacing: 1, color: "#212529" }}>
                DEV
                <Text span c="blue" inherit>
                  CARD
                </Text>
              </Title>
            </Group>

            <Box w={500} visibleFrom="md">
              <TextInput
                placeholder="Search for cards, sets, or products..."
                rightSection={
                  <ActionIcon variant="filled" color="blue" radius="xs" size="lg">
                    <IconSearch size={18} />
                  </ActionIcon>
                }
                radius="xs"
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                styles={{ input: { backgroundColor: "#f8f9fa", border: "1px solid #ced4da" } }}
              />
            </Box>

            <Group gap="lg">
              {status === "authenticated" ? (
                <Menu shadow="md" width={200} trigger="hover" openDelay={100} closeDelay={400}>
                  <Menu.Target>
                    <Group gap={8} style={{ cursor: "pointer", lineHeight: 1 }} visibleFrom="xs">
                      <IconUser size={20} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Account
                        </Text>
                        <Text size="sm" fw={700} c="dark">
                          {session?.user?.name?.split(" ")[0]}
                        </Text>
                      </Box>
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Application</Menu.Label>
                    {session?.user?.role == "Administrator" && (
                      <Menu.Item leftSection={<IconLayoutDashboard size={14} />} onClick={() => router.push("/dashboard/main")}>
                        Dashboard
                      </Menu.Item>
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

              <Indicator label={cartItems.length} size={16} color="red" offset={4} disabled={cartItems.length === 0}>
                <ActionIcon variant="transparent" color="dark" size="xl" onClick={() => setIsDrawerOpen(true)}>
                  <IconShoppingCart size={26} stroke={1.5} />
                </ActionIcon>
              </Indicator>
            </Group>
          </Group>
        </Container>
      </Box>

      <Box bg="#0056b3" c="white" visibleFrom="md" style={{ borderBottom: "4px solid #004494" }}>
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
                  >
                    <Group gap={4}>
                      <Text size="sm" fw={700} style={{ textTransform: "uppercase" }}>
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
    </>
  );
};
