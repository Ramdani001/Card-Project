"use client";

import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Divider,
  Drawer,
  Grid,
  Group,
  Image,
  Indicator,
  LoadingOverlay,
  Menu,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconLayoutDashboard,
  IconLogin,
  IconLogout,
  IconMinus,
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CardData } from "../types/CardData";
import { CartItem } from "../types/CartItem";

export default function TcgCornerClone() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);

  const [products, setProducts] = useState<CardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>("Newest");

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("TRANSFER");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const getCardName = (item: CardData) => item?.detail?.name || "Unknown Item";
  const getCardPrice = (item: CardData) => Number(item?.detail?.price || 0);
  const getCardStock = (item: CardData) => Number(item?.detail?.stock || 0);
  const getCardType = (item: CardData) => item?.typeCard?.name || "General";
  const getCardImage = (item: CardData) => item?.detail?.image?.location || "https://placehold.co/400x560?text=No+Image";
  const getDiscountValue = (item: CardData) => Number(item?.detail?.discount?.discount || 0);
  const hasDiscount = (item: CardData) => getDiscountValue(item) > 0;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/cards");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          console.error("Format API salah", json);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetch cards:", error);
        notifications.show({ title: "Error", message: "Gagal mengambil data produk.", color: "red" });
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const fetchCart = async () => {
    if (status !== "authenticated") return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (res.ok) {
        if (json.data && Array.isArray(json.data.items)) {
          setCartItems(json.data.items);
        } else if (Array.isArray(json.data)) {
          setCartItems(json.data);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Cart error", error);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const availableTypes = useMemo(() => {
    const types = products.map((p) => getCardType(p));
    return Array.from(new Set(types)).filter((t) => t);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const result = products.filter((item) => {
      const matchSearch =
        getCardName(item).toLowerCase().includes(search.toLowerCase()) || getCardType(item).toLowerCase().includes(search.toLowerCase());
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(getCardType(item));
      return matchSearch && matchType;
    });

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => getCardPrice(a) - getCardPrice(b));
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => getCardPrice(b) - getCardPrice(a));
    }

    return result;
  }, [products, search, selectedTypes, sortBy]);

  const handleRemoveItem = async (idCartItem: number) => {
    setProcessingId(idCartItem);
    try {
      const res = await fetch(`/api/cart/${idCartItem}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.idCartItem !== idCartItem));
        notifications.show({ message: "Item dihapus dari keranjang", color: "gray" });
      } else {
        throw new Error("Gagal hapus");
      }
    } catch (error) {
      console.error(error);
      notifications.show({ message: "Gagal menghapus item", color: "red" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateQuantity = async (idCartItem: number, newQty: number) => {
    if (newQty < 1) return;

    setProcessingId(idCartItem);
    try {
      const res = await fetch(`/api/cart/${idCartItem}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        setCartItems((prev) => prev.map((item) => (item.idCartItem === idCartItem ? { ...item, quantity: newQty } : item)));
      }
    } catch (error) {
      console.error("Update qty error", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddToCart = async (product: CardData) => {
    if (status !== "authenticated") {
      notifications.show({ title: "Login Required", message: "Silakan login untuk berbelanja.", color: "red" });
      return router.push("/login");
    }

    setLoadingAction(product.idCard);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCard: product.idCard, quantity: 1 }),
      });

      if (res.ok) {
        notifications.show({ title: "Berhasil", message: "Item ditambahkan ke keranjang.", color: "green", icon: <IconShoppingCart size={16} /> });
        fetchCart();
        setIsDrawerOpen(true);
      } else {
        throw new Error("Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      console.error(error);

      notifications.show({ title: "Error", message: "Terjadi kesalahan sistem.", color: "red" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCheckout = async () => {
    if (!address) {
      notifications.show({ message: "Alamat pengiriman wajib diisi.", color: "red" });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, address }),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({ title: "Order Berhasil!", message: "Terima kasih, pesanan Anda sedang diproses.", color: "blue" });
        setCartItems([]);
        setIsDrawerOpen(false);
        router.push("/");
      } else {
        throw new Error(json.message || "Gagal melakukan transaksi");
      }
    } catch (err: any) {
      notifications.show({ title: "Gagal Checkout", message: err.message, color: "red" });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + getCardPrice(item.card) * item.quantity, 0);

  return (
    <Box style={{ backgroundColor: "#f4f6f8", minHeight: "100vh", color: "#212529", fontFamily: "Arial, sans-serif" }}>
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

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
              <Group justify="space-between" mb="md">
                <Title order={6} tt="uppercase" style={{ letterSpacing: 0.5 }}>
                  Filter Products
                </Title>
                {selectedTypes.length > 0 && (
                  <Text size="xs" c="red" style={{ cursor: "pointer" }} onClick={() => setSelectedTypes([])}>
                    Clear All
                  </Text>
                )}
              </Group>

              <Stack gap="xs">
                <Text size="sm" fw={700} mb={4}>
                  Product Type
                </Text>
                {availableTypes.length > 0 ? (
                  availableTypes.map((type) => (
                    <Checkbox
                      key={type}
                      label={type}
                      checked={selectedTypes.includes(type)}
                      onChange={() => {
                        setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
                      }}
                      styles={{ label: { fontSize: 14, color: "#495057", cursor: "pointer" }, input: { cursor: "pointer" } }}
                    />
                  ))
                ) : (
                  <Text size="xs" c="dimmed">
                    No filters available
                  </Text>
                )}
              </Stack>

              <Divider my="md" />

              <Stack gap="xs">
                <Text size="sm" fw={700} mb={4}>
                  Availability
                </Text>
                <Checkbox label="In Stock" styles={{ label: { fontSize: 14, color: "#495057" } }} />
                <Checkbox label="Out of Stock" styles={{ label: { fontSize: 14, color: "#495057" } }} />
              </Stack>
            </Paper>

            <Paper
              mt="md"
              radius="xs"
              bg="gray.1"
              h={250}
              withBorder
              style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
            >
              <Text fw={700} c="dimmed">
                ADVERTISEMENT
              </Text>
              <Text size="xs" c="dimmed">
                Place your banner here
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Group justify="space-between" mb="lg" align="center">
              <Breadcrumbs separator="→" style={{ fontSize: 12 }}>
                <Anchor href="#" c="dimmed">
                  Home
                </Anchor>
                <Anchor href="#" c="dimmed">
                  Catalog
                </Anchor>
                <Text size="xs" c="dark" fw={600}>
                  All Products
                </Text>
              </Breadcrumbs>

              <Select
                label="Sort By"
                placeholder="Sort by"
                data={["Newest", "Price: Low to High", "Price: High to Low"]}
                value={sortBy}
                onChange={setSortBy}
                size="xs"
                w={200}
                allowDeselect={false}
                variant="filled"
                styles={{ label: { marginBottom: 0, marginRight: 10, display: "inline-block" }, root: { display: "flex", alignItems: "center" } }}
              />
            </Group>

            <Box style={{ minHeight: 400 }}>
              <LoadingOverlay visible={loadingProducts} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

              {filteredProducts.length === 0 && !loadingProducts ? (
                <Paper p="xl" ta="center" withBorder bg="white" radius="xs">
                  <IconSearch size={40} color="gray" style={{ marginBottom: 10 }} />
                  <Text fw={500}>No products found.</Text>
                  <Text size="sm" c="dimmed">
                    Try adjusting your search or filters.
                  </Text>
                  <Button
                    mt="md"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setSelectedTypes([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Paper>
              ) : (
                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md" verticalSpacing="lg">
                  {filteredProducts.map((item) => (
                    <Card
                      key={item.idCard}
                      padding="0"
                      radius="xs"
                      withBorder
                      bg="white"
                      style={{
                        border: "1px solid #dee2e6",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                        e.currentTarget.style.borderColor = "#adb5bd";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#dee2e6";
                      }}
                    >
                      <Card.Section style={{ position: "relative", borderBottom: "1px solid #f1f3f5" }}>
                        {getCardStock(item) === 0 ? (
                          <Badge color="gray" radius="xs" variant="filled" style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                            Sold Out
                          </Badge>
                        ) : (
                          hasDiscount(item) && (
                            <Badge color="red" radius="xs" variant="filled" style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
                              Sale
                            </Badge>
                          )
                        )}

                        <Box p="md" bg="white" h={240} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Image
                            src={getCardImage(item)}
                            alt={getCardName(item)}
                            fit="contain"
                            h="100%"
                            w="auto"
                            fallbackSrc="https://placehold.co/300x420?text=No+Image"
                          />
                        </Box>
                      </Card.Section>

                      <Stack gap={6} p="sm" h={160} justify="space-between" bg="white">
                        <Box>
                          <Text size="10px" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 0.5 }}>
                            {getCardType(item)}
                          </Text>
                          <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.3, minHeight: 38 }} title={getCardName(item)}>
                            {getCardName(item)}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {item?.detail?.note || " "}
                          </Text>
                        </Box>

                        <Box>
                          <Group gap={5} align="flex-end" mb={8}>
                            <Text fw={800} size="md" c="blue">
                              Rp {getCardPrice(item).toLocaleString("id-ID")}
                            </Text>
                            {hasDiscount(item) && (
                              <Text size="xs" td="line-through" c="dimmed" mb={2}>
                                Rp {(getCardPrice(item) + getDiscountValue(item)).toLocaleString("id-ID")}
                              </Text>
                            )}
                          </Group>
                          <Button
                            fullWidth
                            radius="xs"
                            size="xs"
                            color="dark"
                            disabled={getCardStock(item) === 0}
                            onClick={() => handleAddToCart(item)}
                            loading={loadingAction === item.idCard}
                            leftSection={getCardStock(item) > 0 && <IconShoppingCart size={14} />}
                          >
                            {getCardStock(item) === 0 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Grid.Col>
        </Grid>
      </Container>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          <Group>
            <IconShoppingCart size={20} />
            <Text fw={700} size="lg" tt="uppercase" style={{ letterSpacing: 1 }}>
              Your Cart ({cartItems.length})
            </Text>
          </Group>
        }
        position="right"
        padding="md"
        size="md"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Stack h="calc(100vh - 100px)">
          <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
            {loadingCart ? (
              <Center mt="xl">
                <Box>
                  <Text>Loading cart...</Text>
                </Box>
              </Center>
            ) : cartItems.length === 0 ? (
              <Stack align="center" mt={50} gap="xs">
                <IconShoppingCart size={40} color="#ced4da" />
                <Text ta="center" c="dimmed">
                  Your cart is currently empty.
                </Text>
                <Button variant="light" onClick={() => setIsDrawerOpen(false)} mt="md">
                  Continue Shopping
                </Button>
              </Stack>
            ) : (
              cartItems.map((item) => (
                <Paper
                  key={item.idCartItem}
                  radius="md"
                  p="sm"
                  mb="sm"
                  bg="white"
                  withBorder
                  style={{
                    borderColor: "#e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    overflow: "hidden",
                  }}
                >
                  <Group align="center" wrap="nowrap" gap="md">
                    <Box
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 8,
                        overflow: "hidden",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Image src={item.card.detail?.image?.location || "https://placehold.co/60"} w="100%" h="100%" fit="contain" alt="Product" />
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="start" mb={4}>
                        <Box style={{ maxWidth: "85%" }}>
                          <Text size="sm" fw={700} lineClamp={1} title={item.card.detail?.name} c="dark.4">
                            {item.card.detail?.name}
                          </Text>
                          <Text size="xs" c="dimmed" fw={600}>
                            {getCardType(item.card)} • Stock: {getCardStock(item.card)}
                          </Text>
                        </Box>

                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="xs"
                          onClick={() => handleRemoveItem(item.idCartItem)}
                          loading={processingId === item.idCartItem}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>

                      <Group justify="space-between" align="end" mt="xs">
                        <Stack gap={0}>
                          <Text size="xs" c="dimmed">
                            Subtotal:
                          </Text>
                          <Text fw={800} size="md" c="blue.7">
                            Rp {(item.card.detail?.price || 0 * item.quantity).toLocaleString("id-ID")}
                          </Text>
                        </Stack>

                        <Group gap={0} bg="gray.1" style={{ borderRadius: 6, border: "1px solid #dee2e6" }}>
                          <ActionIcon
                            variant="transparent"
                            color="dark"
                            size={28}
                            disabled={processingId === item.idCartItem || item.quantity <= 1}
                            onClick={() => handleUpdateQuantity(item.idCartItem, item.quantity - 1)}
                            style={{ borderRight: "1px solid #dee2e6", borderRadius: "6px 0 0 6px" }}
                          >
                            <IconMinus size={14} />
                          </ActionIcon>

                          <NumberInput
                            value={item.quantity}
                            onChange={(val) => {
                              if (val && Number(val) > 0) {
                                const newQty = Math.min(Number(val), getCardStock(item.card));
                                handleUpdateQuantity(item.idCartItem, newQty);
                              }
                            }}
                            min={1}
                            max={getCardStock(item.card)}
                            allowNegative={false}
                            hideControls
                            size="xs"
                            w={40}
                            variant="unstyled"
                            styles={{
                              input: {
                                textAlign: "center",
                                padding: 0,
                                height: 28,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#212529",
                              },
                            }}
                          />

                          <ActionIcon
                            variant="transparent"
                            color="dark"
                            size={28}
                            disabled={processingId === item.idCartItem || item.quantity >= getCardStock(item.card)}
                            onClick={() => handleUpdateQuantity(item.idCartItem, item.quantity + 1)}
                            style={{ borderLeft: "1px solid #dee2e6", borderRadius: "0 6px 6px 0" }}
                          >
                            <IconPlus size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Box>
                  </Group>
                </Paper>
              ))
            )}
          </ScrollArea>

          {cartItems.length > 0 && (
            <Box>
              <Divider mb="sm" />
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Subtotal
                </Text>
                <Text fw={700} size="lg">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </Text>
              </Group>

              <TextInput
                label="Shipping Address"
                placeholder="Enter full address"
                radius="xs"
                mb="sm"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                required
              />

              <Select
                label="Payment Method"
                data={["TRANSFER", "CREDIT_CARD", "CASH"]}
                value={paymentMethod}
                onChange={setPaymentMethod}
                radius="xs"
                mb="lg"
                allowDeselect={false}
              />

              <Button fullWidth color="blue" radius="xs" size="md" onClick={handleCheckout} loading={isCheckoutLoading}>
                CHECKOUT NOW
              </Button>
            </Box>
          )}
        </Stack>
      </Drawer>

      <Box bg="#212529" c="gray.5" py={50} mt={50} style={{ borderTop: "4px solid #0056b3" }}>
        <Container size="xl">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Title order={4} c="white" mb="md" ff="Impact" style={{ letterSpacing: 1 }}>
                DEVCARD
              </Title>
              <Text size="sm" maw={300}>
                The ultimate destination for trading card games. We sell singles, sealed products, and accessories for all your favorite games.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Title order={6} c="white" mb="md" tt="uppercase">
                Shop
              </Title>
              <Stack gap="xs">
                <Anchor href="#" size="sm" c="dimmed">
                  New Arrivals
                </Anchor>
                <Anchor href="#" size="sm" c="dimmed">
                  Pre-Orders
                </Anchor>
                <Anchor href="#" size="sm" c="dimmed">
                  On Sale
                </Anchor>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Title order={6} c="white" mb="md" tt="uppercase">
                Stay Connected
              </Title>
              <Group gap="xs">
                <TextInput placeholder="Email Address" radius="xs" style={{ flex: 1 }} />
                <Button radius="xs" color="blue">
                  JOIN
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
          <Divider my="xl" color="dark.4" />
          <Group justify="space-between">
            <Text size="xs">© 2026 DevCard. All Rights Reserved.</Text>
            <Text size="xs">Privacy Policy | Terms of Service</Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
