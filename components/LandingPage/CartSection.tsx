"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { ShopDto } from "@/types/dtos/ShopDto";
import { formatRupiah, getCardPrice } from "@/utils";
import { Box, Button, Center, Drawer, Group, Loader, ScrollArea, Stack, Text, TextInput, UnstyledButton, rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconShoppingCart, IconTicket, IconTruckDelivery } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CartItemRow } from "../Cart/CartItemRow";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";

interface CartSectionProps {
  isDrawerOpen: boolean;
  loadingCart: boolean;
  cartItems: CartItemDto[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setCartItems: Dispatch<SetStateAction<CartItemDto[]>>;
}

export const CartSection = ({ isDrawerOpen, loadingCart, cartItems, setIsDrawerOpen, setCartItems }: CartSectionProps) => {
  const router = useRouter();

  const [voucherCode, setVoucherCode] = useState("");
  const [address, setAddress] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const totalAmount = cartItems.reduce((acc, item) => acc + getCardPrice(item) * item.quantity, 0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.SHIP);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [listShop, setListShop] = useState<ShopDto[]>([]);

  const fetchShops = async () => {
    try {
      const res = await fetch(`/api/shops`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      setListShop(json.data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      notifications.show({
        title: "Error",
        message: err.message || "Failed to fetch data",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCheckout = async (voucherCodeFromCart?: string) => {
    // ===== VALIDATION =====
    if (deliveryMethod === DeliveryMethod.SHIP) {
      if (!address.trim()) {
        return notifications.show({
          message: "Shipping address is required.",
          color: "red",
          position: "top-left",
        });
      }
    }

    if (deliveryMethod === DeliveryMethod.PICKUP) {
      if (!selectedShop) {
        return notifications.show({
          message: "Please select a pickup shop.",
          color: "red",
          position: "top-left",
        });
      }
    }

    setIsCheckoutLoading(true);

    try {
      const payload = {
        deliveryMethod,
        address: deliveryMethod === DeliveryMethod.SHIP ? address.trim() : null,
        shopId: deliveryMethod === DeliveryMethod.PICKUP ? selectedShop : null,
        voucherCode: voucherCodeFromCart || null,
      };

      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Checkout failed");
      }

      notifications.show({
        title: "Order Placed!",
        message: "Redirecting to transactions...",
        color: "dark",
        position: "top-left",
      });

      setIsDrawerOpen(false);
      router.push("/my-transaction");
    } catch (err: any) {
      notifications.show({
        title: "Checkout Failed",
        message: err.message,
        color: "red",
        position: "top-left",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;

    const previousItem = cartItems.find((item) => item.id === id);
    const oldQty = previousItem?.quantity || 1;

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));

    setProcessingId(id);

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      const json = await res.json();

      if (!json.success) {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: oldQty } : item)));

        notifications.show({
          title: "Update Failed",
          message: json.message || "Could not update quantity",
          color: "red",
          position: "top-left",
        });
      }
    } catch {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: oldQty } : item)));

      notifications.show({
        title: "Error",
        message: "Internal server error",
        color: "red",
        position: "top-left",
      });
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
        notifications.show({ message: "Item removed from cart", color: "gray", position: "top-left" });
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Drawer
      opened={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      title={
        <Group gap="sm">
          <IconShoppingCart size={22} stroke={2} />
          <Text fw={900} size="xl" lts={-0.5}>
            MY CART
          </Text>
          <Badge variant="filled" color="dark" radius="sm" size="md">
            {cartItems.length}
          </Badge>
        </Group>
      }
      position="right"
      padding="xl"
      size="md"
      overlayProps={{ backgroundOpacity: 0.3, blur: 8 }}
      styles={{
        header: { borderBottom: "1px solid #f1f3f5", marginBottom: rem(20), paddingBottom: rem(15) },
        content: { display: "flex", flexDirection: "column" },
      }}
    >
      <Stack h="calc(100vh - 80px)" justify="space-between">
        <ScrollArea style={{ flex: 1 }} scrollbarSize={4} offsetScrollbars>
          {loadingCart ? (
            <Center mt={100}>
              <Stack align="center" gap="xs">
                <Loader size="sm" color="dark" type="dots" />
                <Text size="xs" c="dimmed">
                  Syncing your cart...
                </Text>
              </Stack>
            </Center>
          ) : cartItems.length === 0 ? (
            <Center mt={100}>
              <Stack align="center" gap="md">
                <Box p="xl" bg="gray.0" style={{ borderRadius: "50%" }}>
                  <IconShoppingCart size={50} stroke={1} color="var(--mantine-color-gray-4)" />
                </Box>
                <Text ta="center" fw={600} c="gray.6">
                  Your cart is empty
                </Text>
                <Button variant="subtle" color="dark" onClick={() => setIsDrawerOpen(false)}>
                  Go back
                </Button>
              </Stack>
            </Center>
          ) : (
            <Stack gap="lg">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} processingId={processingId} onRemove={handleRemoveItem} onUpdate={handleUpdateQuantity} />
              ))}
            </Stack>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <Box pt="xl">
            <Stack gap="md">
              <Box bg="gray.0" p="lg" style={{ borderRadius: rem(12) }}>
                <Group justify="space-between" mb={5}>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    Order Subtotal
                  </Text>
                  <Text fw={900} size="xl" c="dark">
                    {formatRupiah(totalAmount)}
                  </Text>
                </Group>
                <Text size="10px" c="dimmed">
                  Taxes and discounts calculated at checkout
                </Text>
              </Box>

              <TextInput
                placeholder="Voucher Code"
                leftSection={<IconTicket size={16} stroke={1.5} />}
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.currentTarget.value)}
                radius="md"
                size="md"
              />

              <Stack gap="xs">
                <Text fw={600} size="sm">
                  Delivery
                </Text>

                {/* Toggle */}
                <Group grow>
                  <UnstyledButton
                    onClick={() => setDeliveryMethod(DeliveryMethod.SHIP)}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: deliveryMethod === DeliveryMethod.SHIP ? "2px solid black" : "1px solid #e9ecef",
                      background: deliveryMethod === DeliveryMethod.SHIP ? "#fff" : "#f8f9fa",
                      padding: "10px 12px",
                    }}
                  >
                    <Group justify="center" gap={6}>
                      <IconTruckDelivery size={18} stroke={1.8} />
                      <Text size="sm" fw={500}>
                        Ship
                      </Text>
                    </Group>
                  </UnstyledButton>

                  <UnstyledButton
                    onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: deliveryMethod === DeliveryMethod.PICKUP ? "2px solid black" : "1px solid #e9ecef",
                      background: deliveryMethod === DeliveryMethod.PICKUP ? "#fff" : "#f8f9fa",
                      padding: "10px 12px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Group justify="center" gap={6}>
                      <IconMapPin size={18} stroke={1.8} />
                      <Text size="sm" fw={500}>
                        Pickup
                      </Text>
                    </Group>
                  </UnstyledButton>
                </Group>

                {deliveryMethod === DeliveryMethod.SHIP && (
                  <TextInput
                    placeholder="Shipping Address"
                    radius="md"
                    size="md"
                    value={address}
                    onChange={(e) => setAddress(e.currentTarget.value)}
                    required
                  />
                )}

                {deliveryMethod === DeliveryMethod.PICKUP && (
                  <Stack gap="xs">
                    {listShop.map((item) => (
                      <Box
                        key={item.id}
                        onClick={() => setSelectedShop(item.id)}
                        p="md"
                        style={{
                          borderRadius: 12,
                          cursor: "pointer",
                          border: selectedShop === item.id ? "2px solid black" : "1px solid #e9ecef",
                          background: selectedShop === item.id ? "#fff" : "#f8f9fa",
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <div>
                            <Text fw={600} size="sm">
                              {item.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.address || "No address"}
                            </Text>
                          </div>
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>

              <Button
                fullWidth
                color="dark"
                radius="md"
                size="lg"
                onClick={() => handleCheckout(voucherCode)}
                loading={isCheckoutLoading}
                disabled={(deliveryMethod === DeliveryMethod.SHIP && !address.trim()) || (deliveryMethod === DeliveryMethod.PICKUP && !selectedShop)}
                style={{ height: rem(54) }}
              >
                CHECKOUT NOW
              </Button>

              <Text ta="center" size="xs" c="dimmed" px="xl">
                By clicking checkout, you agree to our terms and conditions.
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
};

const Badge = ({ children }: any) => (
  <Box bg="dark" c="white" px={8} style={{ borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
    {children}
  </Box>
);
