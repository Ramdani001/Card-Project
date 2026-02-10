"use client";

import { CartSection } from "@/components/LandingPage/CartSection";
import { FilterSection } from "@/components/LandingPage/FilterSection";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { Box, Center, Container, Grid, Group, Loader, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartItem } from "@/types/CartItem";
import { CardData } from "@/types/CardData";

export default function TcgCornerClone() {
  const router = useRouter();
  const { status } = useSession();

  const [products, setProducts] = useState<CardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>("Newest");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("TRANSFER");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const getCardName = (item: CardData) => item?.name || "Unknown Item";
  const getCardPrice = (item: CardData) => Number(item?.price || 0);

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
    fetchProducts();
  }, []);

  const fetchCart = async () => {
    if (status !== "authenticated") return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (res.ok) {
        if (Array.isArray(json.data)) {
          setCartItems(json.data);
        } else if (json.data?.items) {
          setCartItems(json.data.items);
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

  const availableCategories = useMemo(() => {
    const categoriesMap = new Map<string, string>();
    products.forEach((p) => {
      p.categories.forEach((c) => {
        categoriesMap.set(c.category.id, c.category.name);
      });
    });
    return Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const result = products.filter((item) => {
      const matchSearch =
        getCardName(item).toLowerCase().includes(search.toLowerCase()) || (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategoryIds.length === 0 || item.categories.some((c) => selectedCategoryIds.includes(c.category.id));

      return matchSearch && matchCategory;
    });

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => getCardPrice(a) - getCardPrice(b));
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => getCardPrice(b) - getCardPrice(a));
    }

    return result;
  }, [products, search, selectedCategoryIds, sortBy]);

  const handleAddToCart = async (product: CardData) => {
    if (status !== "authenticated") {
      notifications.show({ title: "Login Required", message: "Silakan login untuk berbelanja.", color: "red" });
      return router.push("/login");
    }

    setLoadingAction(product.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        notifications.show({
          title: "Berhasil",
          message: "Item ditambahkan ke keranjang.",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        fetchCart();
        setIsDrawerOpen(true);
      } else {
        const json = await res.json();
        throw new Error(json.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error: any) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        notifications.show({ message: "Item dihapus", color: "gray" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckout = async (voucherCodeFromCart?: string) => {
    if (!address) {
      notifications.show({ message: "Alamat pengiriman wajib diisi.", color: "red" });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          paymentMethod,
          voucherCode: voucherCodeFromCart,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({ title: "Order Berhasil!", message: "Silakan selesaikan pembayaran.", color: "blue" });
        setCartItems([]);
        setIsDrawerOpen(false);

        if (json.data?.snapRedirect) {
          window.location.href = json.data.snapRedirect;
        } else {
          router.push("/transactions");
        }
      } else {
        throw new Error(json.message || "Gagal checkout");
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
      <HeaderSection
        search={search}
        setSearch={setSearch}
        cartItems={cartItems}
        setIsDrawerOpen={setIsDrawerOpen}
        cartItemCount={cartItems.length}
        onOpenCart={() => setIsDrawerOpen(true)}
      />

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Sidebar Filter */}
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <FilterSection
              categories={availableCategories}
              selectedCategoryIds={selectedCategoryIds}
              setSelectedCategoryIds={setSelectedCategoryIds}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Group justify="flex-end" mb="lg" align="center">
              <Select
                placeholder="Sort by"
                data={["Newest", "Price: Low to High", "Price: High to Low"]}
                value={sortBy}
                onChange={setSortBy}
                size="xs"
                w={200}
                allowDeselect={false}
              />
            </Group>

            {loadingProducts ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : filteredProducts.length > 0 ? (
              <ListCardSection
                products={filteredProducts}
                handleAddToCart={handleAddToCart}
                loadingAction={loadingAction}
                setSearch={setSearch}
                loadingProducts={loadingProducts}
              />
            ) : (
              <Center h={300}>
                <Text c="dimmed">No products found.</Text>
              </Center>
            )}
          </Grid.Col>
        </Grid>
      </Container>

      <CartSection
        cartItems={cartItems}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        loadingCart={loadingCart}
        handleRemoveItem={handleRemoveItem}
        handleUpdateQuantity={handleUpdateQuantity}
        processingId={processingId}
        handleCheckout={handleCheckout}
        isCheckoutLoading={isCheckoutLoading}
        totalAmount={totalAmount}
        address={address}
        setAddress={setAddress}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <FooterSection />
    </Box>
  );
}
