import { CartItemDto } from "@/types/dtos/CartItemDto";
import { getCardImage, getCardName, getCardPrice, getCardStock, getCardType } from "@/utils";
import { ActionIcon, Box, Group, Image, NumberInput, Paper, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { memo } from "react";

interface CardItemRowProps {
  item: CartItemDto;
  processingId: string | null;
  onRemove: (id: string) => void;
  onUpdate: (id: string, qty: number) => void;
}

export const CartItemRow = memo(({ item, processingId, onRemove, onUpdate }: CardItemRowProps) => {
  const stock = getCardStock(item);
  const price = getCardPrice(item);
  const isProcessing = processingId === item.id;

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
          <Image src={getCardImage(item)} w="100%" h="100%" fit="contain" alt={getCardName(item)} />
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

            <ActionIcon variant="subtle" color="red" size="xs" onClick={() => onRemove(item.id)} loading={isProcessing}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>

          <Group justify="space-between" align="end" mt="xs">
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                Subtotal:
              </Text>
              <Text fw={800} size="md" c="blue.7">
                Rp {(price * item.quantity).toLocaleString("id-ID")}
              </Text>
            </Stack>

            <Group gap={0} bg="gray.1" style={{ borderRadius: 6, border: "1px solid #dee2e6" }}>
              <NumberInput
                value={item.quantity}
                onChange={(val) => {
                  if (val && Number(val) > 0) {
                    onUpdate(item.id, Number(val));
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
});
CartItemRow.displayName = "CartItemRow";
