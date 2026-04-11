import { CardDto } from "@/types/dtos/CardDto";
import { formatRupiah } from "@/utils";
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  rem,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconInfoCircle, IconMinus, IconPackage, IconPlus, IconShoppingCart, IconX } from "@tabler/icons-react";
import { useState } from "react";

interface CardCatalogModalProps {
  opened: boolean;
  onClose: () => void;
  product: CardDto | null;
  handleAddToCart: (product: CardDto, quantity: number) => Promise<void>;
  loadingAction: string | null;
}

export const CardCatalogModal = ({ opened, onClose, product, handleAddToCart, loadingAction }: CardCatalogModalProps) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const discountValue = product.discount ? Number(product.discount.value) : 0;
  const isOutOfStock = product.stock === 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      fullScreen
      padding={0}
      radius="md"
      withCloseButton={false} // Custom close button untuk kontrol desain
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 4,
      }}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Grid overflow="hidden" style={{ borderRadius: rem(12) }}>
        {/* Kolom Gambar - Visual Dominan */}
        <Grid.Col span={{ base: 12, md: 5.5 }} bg="gray.0">
          <Box p="xl" style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
            <ActionIcon
              onClick={onClose}
              variant="subtle"
              color="gray"
              style={{ position: "absolute", top: 15, left: 15, zIndex: 10 }}
              hiddenFrom="md"
            >
              <IconX size={20} />
            </ActionIcon>

            <AspectRatio ratio={1 / 1} w="100%" maw={450} mx="auto">
              <Image
                src={product.images?.[0]?.url || "https://placehold.co/600x600?text=No+Image"}
                alt={product.name}
                fit="contain"
                fallbackSrc="https://placehold.co/600x600?text=No+Image"
              />
            </AspectRatio>
          </Box>
        </Grid.Col>

        {/* Kolom Informasi */}
        <Grid.Col span={{ base: 12, md: 6.5 }}>
          <Stack p={{ base: "lg", md: rem(40) }} gap="xl">
            <Box>
              <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
                <Group gap={6}>
                  {product.categories.map((cat) => (
                    <Badge key={cat.category.id} variant="dot" color="blue" size="sm" tt="capitalize">
                      {cat.category.name}
                    </Badge>
                  ))}
                </Group>
                <ActionIcon onClick={onClose} variant="subtle" color="gray" visibleFrom="md">
                  <IconX size={20} />
                </ActionIcon>
              </Group>

              <Text size={rem(32)} fw={800} lh={1.2} mb="xs" c="dark.7">
                {product.name}
              </Text>

              <Text size="xs" c="dimmed" ff="monospace" mb="lg">
                SKU: {product.sku || "N/A"}
              </Text>

              <Paper withBorder p="md" radius="md">
                <Group align="center">
                  <Stack gap={2}>
                    <Text size={rem(28)} fw={900} c="blue.9" style={{ lineHeight: 1 }}>
                      {formatRupiah(product.price)}
                    </Text>
                    {discountValue > 0 && (
                      <Group gap="xs">
                        <Text size="sm" c="gray.5" td="line-through">
                          {formatRupiah(Number(product.price) + discountValue)}
                        </Text>
                        <Badge color="red" variant="filled" size="xs">
                          {product.discount?.type === "PERCENTAGE" ? `-${discountValue}%` : "Discount"}
                        </Badge>
                      </Group>
                    )}
                  </Stack>
                </Group>
              </Paper>
            </Box>

            <Box>
              <Group gap={8} mb={10}>
                <ThemeIcon size={24} variant="light" color="blue" radius="xl">
                  <IconInfoCircle size={14} />
                </ThemeIcon>
                <Text fw={700} size="sm" c="dark.6">
                  Product Description
                </Text>
              </Group>
              <Text size="sm" c="gray.7" style={{ lineHeight: 1.7 }}>
                {product.description || "Detailed specifications for this premium product are not yet available."}
              </Text>
            </Box>

            <Divider />

            <Group grow align="flex-end">
              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
                  Quantity
                </Text>
                <Group
                  gap={0}
                  style={{
                    border: `${rem(1)} solid var(--mantine-color-gray-3)`,
                    borderRadius: rem(8),
                    width: "fit-content",
                    overflow: "hidden",
                  }}
                >
                  <ActionIcon
                    size={42}
                    variant="subtle"
                    color="gray"
                    radius={0}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    <IconMinus size={16} />
                  </ActionIcon>

                  <NumberInput
                    value={quantity}
                    onChange={(val) => setQuantity(Number(val))}
                    min={1}
                    max={product.stock}
                    hideControls
                    variant="unstyled"
                    styles={{
                      input: {
                        textAlign: "center",
                        width: rem(50),
                        fontWeight: 700,
                        fontSize: rem(16),
                        height: rem(42),
                      },
                    }}
                    disabled={isOutOfStock}
                  />

                  <ActionIcon
                    size={42}
                    variant="subtle"
                    color="gray"
                    radius={0}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Group>
              </Box>

              <Stack gap={4}>
                <Group gap={6} justify="flex-end">
                  <IconPackage size={14} color={isOutOfStock ? "red" : "green"} />
                  <Text size="xs" fw={600} c={isOutOfStock ? "red.7" : "gray.6"}>
                    {isOutOfStock ? "Out of Stock" : `${product.stock} units left`}
                  </Text>
                </Group>
                <Button
                  fullWidth
                  leftSection={<IconShoppingCart size={20} />}
                  size="lg"
                  radius="md"
                  color="dark"
                  disabled={isOutOfStock}
                  loading={loadingAction != null}
                  onClick={() => handleAddToCart(product, quantity)}
                >
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </Button>
              </Stack>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};
