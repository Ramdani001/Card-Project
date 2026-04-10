import { CartItemDto } from "@/types/dtos/CartItemDto";
import { formatRupiah, getCardPrice } from "@/utils";
import { Box, Button, Center, Divider, Drawer, Group, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShoppingCart, IconX } from "@tabler/icons-react";
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
      notifications.show({ message: "Shipping address is required.", color: "red" });
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
        notifications.show({ title: "Order Placed!", message: "Please complete your payment.", color: "blue" });
        setIsDrawerOpen(false);

        router.push("/my-transaction");
      } else {
        throw new Error(json.message || "Checkout failed");
      }
    } catch (err: any) {
      notifications.show({ title: "Checkout Failed", message: err.message, color: "red" });
    } finally {
      setIsCheckoutLoading(false);
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

      const json = await res.json();

      if (json.success) {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: 1 } : item)));
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: 1 } : item)));
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
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
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
      <Stack h="calc(100vh - 100px)" justify="space-between">
        <ScrollArea style={{ flex: 1, height: "100%" }} scrollbarSize={6}>
          {loadingCart ? (
            <Center mt="xl">
              <Box>
                <Text size="sm" c="dimmed">
                  Loading cart...
                </Text>
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
            <Stack gap="sm">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} processingId={processingId} onRemove={handleRemoveItem} onUpdate={handleUpdateQuantity} />
              ))}
            </Stack>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <Box pt="md" style={{ borderTop: "1px solid #eee" }}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Subtotal
              </Text>
              <Text fw={700} size="lg">
                {formatRupiah(totalAmount)}
              </Text>
            </Group>

            <Divider mb="sm" variant="dashed" />

            <Group align="flex-end" mb="sm">
              <TextInput
                label="Voucher Code"
                placeholder="EX: DISKON10"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="xs"
              />
            </Group>

            <TextInput
              label="Shipping Address"
              placeholder="Enter full address..."
              radius="xs"
              mb="sm"
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              required
              data-autofocus
            />

            <Button
              fullWidth
              color="blue"
              radius="xs"
              size="md"
              onClick={() => handleCheckout(voucherCode)}
              loading={isCheckoutLoading}
              disabled={!address}
            >
              CHECKOUT NOW
            </Button>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
};
