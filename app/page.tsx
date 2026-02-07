"use client";

import { CartSection } from "@/components/LandingPage/CartSection";
import { FilterSection } from "@/components/LandingPage/FilterSection";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { Box, Container, Grid, Group, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShoppingCart } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CardData } from "../types/CardData";
import { CartItem } from "../types/CartItem";

export default function TcgCornerClone() {
  const router = useRouter();
  const { status } = useSession();

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
        // setIsDrawerOpen(true);
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
      <HeaderSection search={search} setSearch={setSearch} cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <FilterSection availableTypes={availableTypes} selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Group justify="flex-end" mb="lg" align="center">
              <Select
                label="Sort By"
                placeholder="Sort by"
                data={["Newest", "Price: Low to High", "Price: High to Low"]}
                value={sortBy}
                onChange={setSortBy}
                size="xs"
                w={300}
                allowDeselect={false}
                variant="filled"
                styles={{ label: { marginBottom: 0, marginRight: 10, display: "inline-block" }, root: { display: "flex", alignItems: "center" } }}
              />
            </Group>

            <ListCardSection
              filteredProducts={filteredProducts}
              loadingProducts={loadingProducts}
              setSearch={setSearch}
              setSelectedTypes={setSelectedTypes}
              getCardName={getCardName}
              getCardPrice={getCardPrice}
              getCardStock={getCardStock}
              getCardType={getCardType}
              handleAddToCart={handleAddToCart}
              loadingAction={loadingAction}
            />
          </Grid.Col>
        </Grid>
      </Container>

      <CartSection
        cartItems={cartItems}
        isDrawerOpen={isDrawerOpen}
        loadingCart={loadingCart}
        setIsDrawerOpen={setIsDrawerOpen}
        handleRemoveItem={handleRemoveItem}
        handleUpdateQuantity={handleUpdateQuantity}
        processingId={processingId}
        handleCheckout={handleCheckout}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        address={address}
        isCheckoutLoading={isCheckoutLoading}
        setAddress={setAddress}
        totalAmount={totalAmount}
      />

      <FooterSection />
    </Box>
  );
}
