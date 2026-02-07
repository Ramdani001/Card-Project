import { CartItem } from "@/types/CartItem";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  Image,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { Dispatch, SetStateAction, memo } from "react";

const getCardName = (item: CartItem) => item.card?.detail?.name || "Unknown Item";
const getCardStock = (item: CartItem) => Number(item.card?.detail?.stock || 0);
const getCardType = (item: CartItem) => item.card?.typeCard?.name || "General";
const getCardImage = (item: CartItem) => item.card.detail?.image?.location || "https://placehold.co/60";

const CartItemRow = memo(
  ({
    item,
    processingId,
    onRemove,
    onUpdate,
  }: {
    item: CartItem;
    processingId: number | null;
    onRemove: (id: number) => void;
    onUpdate: (id: number, qty: number) => void;
  }) => {
    const stock = getCardStock(item);
    const isProcessing = processingId === item.idCartItem;

    return (
      <Paper
        radius="md"
        p="sm"
        mb="sm"
        bg="white"
        withBorder
        style={{
          borderColor: "#e9ecef",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
            <Image src={getCardImage(item)} w="100%" h="100%" fit="contain" alt="Product" />
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="start" mb={4}>
              <Box style={{ maxWidth: "85%" }}>
                <Text size="sm" fw={700} lineClamp={1} title={getCardName(item)} c="dark.4">
                  {getCardName(item)}
                </Text>
                <Text size="xs" c="dimmed" fw={600}>
                  {getCardType(item)} • Stock: {stock}
                </Text>
              </Box>

              <ActionIcon variant="subtle" color="red" size="xs" onClick={() => onRemove(item.idCartItem)} loading={isProcessing}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>

            <Group justify="space-between" align="end" mt="xs">
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Subtotal:
                </Text>
                <Text fw={800} size="md" c="blue.7">
                  Rp {((item.card.detail?.price || 0) * item.quantity).toLocaleString("id-ID")}
                </Text>
              </Stack>

              <Group gap={0} bg="gray.1" style={{ borderRadius: 6, border: "1px solid #dee2e6" }}>
                <NumberInput
                  value={item.quantity}
                  onChange={(val) => {
                    if (val && Number(val) > 0) {
                      onUpdate(item.idCartItem, Number(val));
                    }
                  }}
                  min={1}
                  max={stock}
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
              </Group>
            </Group>
          </Box>
        </Group>
      </Paper>
    );
  }
);
CartItemRow.displayName = "CartItemRow";

interface CartSectionProps {
  isDrawerOpen: boolean;
  loadingCart: boolean;
  cartItems: CartItem[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  handleRemoveItem: (idCartItem: number) => Promise<void>;
  handleUpdateQuantity: (idCartItem: number, newQty: number) => Promise<void>;
  processingId: number | null;
  handleCheckout: () => Promise<void>;
  setPaymentMethod: Dispatch<SetStateAction<string | null>>;
  paymentMethod: string | null;
  totalAmount: number;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  isCheckoutLoading: boolean;
}

export const CartSection = ({
  isDrawerOpen,
  loadingCart,
  cartItems,
  setIsDrawerOpen,
  handleRemoveItem,
  handleUpdateQuantity,
  processingId,
  handleCheckout,
  paymentMethod,
  totalAmount,
  address,
  setAddress,
  setPaymentMethod,
  isCheckoutLoading,
}: CartSectionProps) => {
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
              <CartItemRow
                key={item.idCartItem}
                item={item}
                processingId={processingId}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateQuantity}
              />
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
  );
};
