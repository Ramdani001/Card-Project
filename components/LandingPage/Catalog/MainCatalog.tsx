"use client";

import { CartSection } from "@/components/LandingPage/CartSection";
import { FilterSection } from "@/components/LandingPage/FilterSection";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { CardData } from "@/types/CardData";
import { CartItem } from "@/types/CartItem";
import { Box, Center, Container, Grid, Group, Loader, Pagination, Select, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "createdAt|desc", label: "Newest" },
  { value: "price|asc", label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "createdAt|asc", label: "Oldest" },
];

export default function MainCatalog() {
  const router = useRouter();
  const { status } = useSession();

  const [products, setProducts] = useState<CardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedFilterStock, setSelectedFilterStock] = useState<string>("off");
  const [sortValue, setSortValue] = useState<string | null>("createdAt|desc");

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("createdAt");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);

  const getCardPrice = (item: CardData) => Number(item?.price || 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success) {
          setCategoriesList(json.data);
        }
      } catch (error) {
        console.error("Gagal ambil kategori:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      params.append("page", activePage.toString());
      params.append("limit", "12");

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (sortValue) {
        const [field, direction] = sortValue.split("|");
        params.append("sortBy", field);
        params.append("sortOrder", direction);
      }
      if (selectedCategoryIds.length > 0) {
        params.append("categories", selectedCategoryIds.join(","));
      }
      if (selectedFilterStock) {
        params.append("stock", selectedFilterStock);
      }

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setProducts(json.data);
        setTotalPages(json.metadata.totalPages);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetch cards:", error);
      notifications.show({ title: "Error", message: "Gagal mengambil data produk.", color: "red" });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    setActivePage(1);
  }, [debouncedSearch, selectedCategoryIds, sortValue]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, debouncedSearch, selectedCategoryIds, sortValue, selectedFilterStock]);

  useEffect(() => {
    if (status === "authenticated") fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchCart = async () => {
    if (status !== "authenticated") return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (res.ok) {
        if (Array.isArray(json.data)) setCartItems(json.data);
        else if (json.data?.items) setCartItems(json.data.items);
        else setCartItems([]);
      }
    } catch (error) {
      console.error("Cart error", error);
    } finally {
      setLoadingCart(false);
    }
  };

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
        // setIsDrawerOpen(true);
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
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <FilterSection
              categories={categoriesList}
              selectedCategoryIds={selectedCategoryIds}
              setSelectedCategoryIds={setSelectedCategoryIds}
              setSelectedFilterStock={setSelectedFilterStock}
              selectedFilterStock={selectedFilterStock}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Group justify="flex-end" mb="lg" align="center">
              <Select
                placeholder="Sort by"
                data={["Newest", "Price: Low to High", "Price: High to Low"]}
                value={SORT_OPTIONS.find((e) => e.value == sortValue)?.label || "Newest"}
                onChange={(e) => {
                  setSortValue(SORT_OPTIONS.find((x) => x.label == e)?.value || "");
                }}
                size="xs"
                w={200}
                allowDeselect={false}
              />
            </Group>

            {loadingProducts ? (
              <Center h={300}>
                <Loader />
              </Center>
            ) : products.length > 0 ? (
              <>
                <ListCardSection
                  products={products}
                  handleAddToCart={handleAddToCart}
                  loadingAction={loadingAction}
                  setSearch={setSearch}
                  loadingProducts={loadingProducts}
                />

                <Center mt="xl">
                  <Pagination total={totalPages} value={activePage} onChange={setActivePage} color="blue" withEdges siblings={1} />
                </Center>
              </>
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
