"use client";

import { DeliveryMethod } from "@/prisma/generated/prisma/enums";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Option } from "@/types/dtos/Option";
import { ShopDto } from "@/types/dtos/ShopDto";
import { getCardPrice } from "@/utils";
import { Box, Button, Center, Group, Loader, Modal, ScrollArea, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconShoppingCart } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CartItemRows } from "./CartItemRows";
import { CheckoutForm } from "./CheckoutForm";

interface CartSectionProps {
  isDrawerOpen: boolean;
  loadingCart: boolean;
  cartItems: CartItemDto[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setCartItems: Dispatch<SetStateAction<CartItemDto[]>>;
}

interface CourierOption {
  courier_code: string;
  courier_name: string;
  price: number;
  estimation: string | null;
}

export const CartSection = ({ isDrawerOpen, loadingCart, cartItems, setIsDrawerOpen, setCartItems }: CartSectionProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const userId = session?.user?.id;

  const [voucherCode, setVoucherCode] = useState("");
  const [address, setAddress] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.SHIP);
  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);
  const [listShop, setListShop] = useState<ShopDto[]>([]);

  const [countries, setCountries] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [subDistricts, setSubDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [subDistrictCode, setSubDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierCode, setSelectedCourierCode] = useState<string | null>(null);

  const selectedCourierData = couriers.find((c) => c.courier_code === selectedCourierCode);
  const shippingFee = selectedCourierData ? selectedCourierData.price : 0;

  const totalAmount = cartItems.reduce((acc, item) => acc + getCardPrice(item) * item.quantity, 0) + shippingFee;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/profile/${userId}`);
        const json = await res.json();
        if (json.success) {
          setAddress(json.data.address || "");
          setCountryIsoCode(json.data.countryIsoCode || "");
          setProvinceCode(json.data.provinceCode || "");
          setCityCode(json.data.cityCode || "");
          setSubDistrictCode(json.data.subDistrictCode || "");
          setVillageCode(json.data.villageCode || "");
          setPostalCode(json.data.postalCode || "");
        }
      } catch {
        notifications.show({ title: "Error", message: "Gagal memuat profil", color: "red" });
      }
    };
    if (status === "authenticated") fetchProfile();
  }, [userId, status]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch(`/api/shops`);
        const json = await res.json();
        if (json.success) setListShop(json.data);
      } catch (err: any) {
        console.error(err);
      }
    };
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/countries");
        const json = await res.json();
        setCountries(json.data.map((item: any) => ({ value: item.isoCode, label: item.name })));
      } catch (error) {
        console.error(error);
      }
    };

    if (isDrawerOpen) {
      fetchShops();
      fetchCountries();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (countryIsoCode) {
      fetch(`/api/provincies?country.isoCode=${countryIsoCode}`)
        .then((res) => res.json())
        .then((json) => setProvinces(json.data.map((i: any) => ({ value: i.code, label: i.name }))));
    } else {
      setProvinces([]);
      setProvinceCode("");
    }
  }, [countryIsoCode]);

  useEffect(() => {
    if (provinceCode) {
      fetch(`/api/cities?province.code=${provinceCode}`)
        .then((res) => res.json())
        .then((json) => setCities(json.data.map((i: any) => ({ value: i.code, label: i.name }))));
    } else {
      setCities([]);
      setCityCode("");
    }
  }, [provinceCode]);

  useEffect(() => {
    if (cityCode) {
      fetch(`/api/sub-districts?city.code=${cityCode}`)
        .then((res) => res.json())
        .then((json) => setSubDistricts(json.data.map((i: any) => ({ value: i.code, label: i.name }))));
    } else {
      setSubDistricts([]);
      setSubDistrictCode("");
    }
  }, [cityCode]);

  useEffect(() => {
    if (subDistrictCode) {
      fetch(`/api/villages?subDistrict.code=${subDistrictCode}`)
        .then((res) => res.json())
        .then((json) => setVillages(json.data.map((i: any) => ({ value: i.code, label: i.name }))));
    } else {
      setVillages([]);
      setVillageCode("");
    }
  }, [subDistrictCode]);

  useEffect(() => {
    const calculateShipping = async () => {
      if (deliveryMethod !== DeliveryMethod.SHIP || !villageCode) {
        setCouriers([]);
        setSelectedCourierCode(null);
        return;
      }

      try {
        const shopRes = await fetch(`/api/shops?isMainShop=true`);
        const shopJson = await shopRes.json();

        if (!shopJson.success || !shopJson.data) {
          console.error("Main shop tidak ditemukan di database");
          setCouriers([]);
          return;
        }

        const mainShop = shopJson.data[0];

        if (!mainShop.villageCode || mainShop.villageCode === "undefined") {
          console.error("Main shop tidak memiliki kode kelurahan (villageCode)");
          setCouriers([]);
          return;
        }

        setSelectedShop(mainShop);

        const totalWeight = cartItems.reduce((acc, item) => acc + (item.card?.weight || 0) * item.quantity, 0);

        const res = await fetch(`/api/shipping-cost?origin=${mainShop.villageCode}&destination=${villageCode}&weight=${totalWeight}`);
        const json = await res.json();

        if (json.success && json.data?.couriers) {
          setCouriers(json.data.couriers);
        } else {
          setCouriers([]);
        }
      } catch (err) {
        console.error("Error fetching courier cost:", err);
        setCouriers([]);
      }
    };

    calculateShipping();
  }, [deliveryMethod, villageCode, cartItems]);

  const handleCheckout = async () => {
    const isShipping = deliveryMethod === DeliveryMethod.SHIP;

    if (isShipping && (!address.trim() || !provinceCode || !cityCode || !subDistrictCode || !postalCode || !selectedCourierCode)) {
      return notifications.show({ title: "Incomplete Shipping Info", message: "Please fill all address fields and choose a courier.", color: "red" });
    }
    if (deliveryMethod === DeliveryMethod.PICKUP && !selectedShop) {
      return notifications.show({ title: "No Shop Selected", message: "Please select a pickup location.", color: "red" });
    }

    setIsCheckoutLoading(true);
    try {
      const payload = {
        deliveryMethod,
        voucherCode: voucherCode || null,
        countryIsoCode: isShipping ? countryIsoCode : null,
        provinceCode: isShipping ? provinceCode : null,
        cityCode: isShipping ? cityCode : null,
        subDistrictCode: isShipping ? subDistrictCode : null,
        villageCode: isShipping ? villageCode : null,
        postalCode: isShipping ? postalCode : null,
        address: isShipping ? address.trim() : null,
        shopId: deliveryMethod === DeliveryMethod.PICKUP ? selectedShop?.id : null,
        courierCode: isShipping ? selectedCourierCode : null,
        shippingFee: isShipping ? shippingFee : null,
      };

      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("An error occurred during checkout.");

      notifications.show({ title: "Order Placed Successfully!", message: "Redirecting...", color: "green" });
      setIsDrawerOpen(false);
      router.push("/my-transaction");
    } catch (err: any) {
      notifications.show({ title: "Checkout Failed", message: err.message, color: "red" });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    const oldItems = [...cartItems];
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      const json = await res.json();
      if (!json.success) setCartItems(oldItems);
    } catch {
      setCartItems(oldItems);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        notifications.show({ message: "Item removed from cart", color: "gray" });
      }
    } catch {
      setProcessingId(null);
    }
  };

  const isCheckoutDisabled =
    (deliveryMethod === DeliveryMethod.SHIP && (!address.trim() || !villageCode || !selectedCourierCode)) ||
    (deliveryMethod === DeliveryMethod.PICKUP && !selectedShop);

  const checkoutFormProps = {
    couriers,
    selectedCourierCode,
    setSelectedCourierCode,
    shippingFee,
    totalAmount,
    voucherCode,
    setVoucherCode,
    deliveryMethod,
    setDeliveryMethod,
    address,
    setAddress,
    selectedShop,
    setSelectedShop,
    listShop,
    isCheckoutLoading,
    isCheckoutDisabled,
    onCheckout: handleCheckout,
    countries,
    provinces,
    cities,
    subDistricts,
    villages,
    countryIsoCode,
    setCountryIsoCode,
    provinceCode,
    setProvinceCode,
    cityCode,
    setCityCode,
    subDistrictCode,
    setSubDistrictCode,
    villageCode,
    setVillageCode,
    postalCode,
    setPostalCode,
  };

  return (
    <Modal
      opened={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      title={
        <Group gap="sm">
          <IconShoppingCart size={22} stroke={2} />
          <Text fw={900} size="xl" lts={-0.5}>
            MY CART
          </Text>
          <Box bg="dark" c="white" px={8} py={3} style={{ borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
            {cartItems.length}
          </Box>
        </Group>
      }
      size={isMobile ? "100%" : "75vw"}
      fullScreen={isMobile}
      radius={isMobile ? 0 : "lg"}
      overlayProps={{ backgroundOpacity: 0.3, blur: 8 }}
      // Remove default modal body padding so we control it ourselves
      styles={{
        body: { padding: 0, overflow: "hidden" },
      }}
    >
      {/* ── Empty / Loading state ── */}
      {(loadingCart || cartItems.length === 0) && (
        <Center py={80}>
          {loadingCart ? (
            <Stack align="center" gap="xs">
              <Loader size="sm" color="dark" type="dots" />
              <Text size="xs" c="dimmed">
                Syncing your cart...
              </Text>
            </Stack>
          ) : (
            <Stack align="center" gap="md">
              <Text fw={600} c="gray.6">
                Your cart is empty
              </Text>
              <Button variant="subtle" color="dark" onClick={() => setIsDrawerOpen(false)}>
                Go back
              </Button>
            </Stack>
          )}
        </Center>
      )}

      {/* ── MOBILE: single scroll, items on top, form below ── */}
      {!loadingCart && cartItems.length > 0 && isMobile && (
        <ScrollArea h="calc(100dvh - 80px)" scrollbarSize={4}>
          <Stack gap="md" p="md">
            <CartItemRows
              cartItems={cartItems}
              processingId={processingId}
              handleRemoveItem={handleRemoveItem}
              handleUpdateQuantity={handleUpdateQuantity}
            />
          </Stack>
          {/* CheckoutForm handles its own sticky top/bottom internally */}
          <Box style={{ borderTop: "1px solid #f1f3f5" }}>
            <CheckoutForm {...checkoutFormProps} />
          </Box>
        </ScrollArea>
      )}

      {/* ── DESKTOP: two-column, each column scrolls independently ── */}
      {!loadingCart && cartItems.length > 0 && !isMobile && (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            height: "80vh",
            overflow: "hidden",
          }}
        >
          {/* Left: cart items — scrollable */}
          <ScrollArea style={{ borderRight: "1px solid #f1f3f5", height: "80vh" }} p="xl" scrollbarSize={4}>
            <CartItemRows
              cartItems={cartItems}
              processingId={processingId}
              handleRemoveItem={handleRemoveItem}
              handleUpdateQuantity={handleUpdateQuantity}
            />
          </ScrollArea>

          {/* Right: checkout form — sticky top summary + internal scroll + sticky bottom button */}
          {/* No ScrollArea wrapper here — CheckoutForm manages its own scroll internally */}
          <Box style={{ height: "80vh", overflow: "hidden" }}>
            <CheckoutForm {...checkoutFormProps} />
          </Box>
        </Box>
      )}
    </Modal>
  );
};
