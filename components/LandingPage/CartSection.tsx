"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { formatRupiah, getCardPrice } from "@/utils";
import { Box, Button, Center, Drawer, Group, Loader, ScrollArea, Stack, Text, TextInput, rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconShoppingCart, IconTicket } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { CartItemRow } from "../Cart/CartItemRow";

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

  const handleCheckout = async (voucherCodeFromCart?: string) => {
    if (!address) {
      notifications.show({ message: "Shipping address is required.", color: "red", position: "top-left" });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          paymentMethod: null,
          voucherCode: voucherCodeFromCart,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Order Placed!",
          message: "Redirecting to transactions...",
          color: "dark",
          position: "top-left",
        });
        setIsDrawerOpen(false);
        router.push("/my-transaction");
      } else {
        throw new Error(json.message || "Checkout failed");
      }
    } catch (err: any) {
      notifications.show({ title: "Checkout Failed", message: err.message, color: "red", position: "top-left" });
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

              <TextInput
                placeholder="Shipping Address"
                leftSection={<IconMapPin size={16} stroke={1.5} />}
                radius="md"
                size="md"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                required
              />

              <Button
                fullWidth
                color="dark"
                radius="md"
                size="lg"
                onClick={() => handleCheckout(voucherCode)}
                loading={isCheckoutLoading}
                disabled={!address}
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
