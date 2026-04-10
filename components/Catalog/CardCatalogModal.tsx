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
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconInfoCircle, IconMinus, IconPackage, IconPlus, IconShoppingCart } from "@tabler/icons-react";
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
      radius={0}
      padding={0}
      withCloseButton={true}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }} bg="#f8fafc">
          <Box p="xl" style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Stack align="center" gap="md" w="100%">
              <AspectRatio ratio={3 / 4} w="100%" maw={500} mx="auto">
                <Image
                  src={product.images?.[0]?.url || "https://placehold.co/400x560?text=No+Image"}
                  alt={product.name}
                  fit="contain"
                  radius="xs"
                  fallbackSrc="https://placehold.co/400x560?text=No+Image"
                />
              </AspectRatio>
            </Stack>
          </Box>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack p="xl" gap="lg" justify="space-between" h="100%">
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap={5}>
                  {product.categories.map((cat) => (
                    <Badge key={cat.category.id} variant="light" color="blue" radius="sm">
                      {cat.category.name}
                    </Badge>
                  ))}
                </Group>
                <Text size="xs" c="dimmed" ff="monospace" mr={40}>
                  SKU: {product.sku || "-"}
                </Text>
              </Group>

              <Text size={rem(28)} fw={800} lh={1.2} mb="md">
                {product.name}
              </Text>

              <Group align="flex-end" gap="xs" mb="lg">
                <Text size={rem(32)} fw={900} c="blue.9">
                  {formatRupiah(product.price)}
                </Text>
                {discountValue > 0 && (
                  <Stack gap={0} mb={5}>
                    <Badge color="red" variant="filled" size="sm">
                      {product.discount?.type === "PERCENTAGE" ? `${discountValue}% OFF` : "NOMINAL"}
                    </Badge>
                    <Text size="sm" c="dimmed" td="line-through">
                      {formatRupiah(Number(product.price) + discountValue)}
                    </Text>
                  </Stack>
                )}
              </Group>

              <Divider mb="lg" />

              <Box mb="xl">
                <Group gap={5} mb={8}>
                  <IconInfoCircle size={18} color="var(--mantine-color-blue-filled)" />
                  <Text fw={700} size="sm">
                    Description
                  </Text>
                </Group>
                <Text size="sm" c="gray.7" style={{ lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {product.description || "There is no description for this product yet."}
                </Text>
              </Box>

              <SimpleGrid cols={2} spacing="md">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="teal" radius="md">
                    <IconPackage size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed">
                      Stock
                    </Text>
                    <Text size="sm" fw={600}>
                      {isOutOfStock ? "Out of Stock" : `${product.stock} Available`}
                    </Text>
                  </Box>
                </Group>
                <Stack gap={5}>
                  <Text size="xs" fw={700} c="dimmed">
                    Total
                  </Text>
                  <Group gap={5}>
                    <ActionIcon
                      size="lg"
                      variant="white"
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
                      styles={{ input: { textAlign: "center", width: rem(40), fontWeight: 700 } }}
                      disabled={isOutOfStock}
                    />

                    <ActionIcon
                      size="lg"
                      variant="white"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={isOutOfStock || quantity >= product.stock}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </SimpleGrid>
            </Box>

            <Box bg="#f8fafc" style={{ borderRadius: "8px" }}>
              <Button
                leftSection={<IconShoppingCart size={20} />}
                size="lg"
                radius="xs"
                color={product.stock === 0 ? "gray" : "dark"}
                disabled={isOutOfStock}
                loading={loadingAction != null}
                onClick={() => handleAddToCart(product, quantity)}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </Box>
          </Stack>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};
