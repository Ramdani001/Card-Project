import { CardDto } from "@/types/dtos/CardDto";
import { formatRupiah } from "@/utils";
import { AspectRatio, Badge, Box, Button, Card, Group, Image, Paper, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPackageOff, IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { CardCatalogModal } from "../Catalog/CardCatalogModal";

interface ListCardSectionProps {
  loadingProducts: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
  setSelectedCategoryIds?: Dispatch<SetStateAction<string[]>>;
  products: CardDto[];
  handleAddToCart: (product: CardDto, quantity: number) => Promise<void>;
  loadingAction: string | null;
}

export const ListCardSection = ({ loadingProducts, products, setSearch, handleAddToCart, loadingAction }: ListCardSectionProps) => {
  const getCardImage = (item: CardDto) => item.images?.[0]?.url || "https://placehold.co/400x560?text=No+Image";
  const [selectedProduct, setSelectedProduct] = useState<CardDto | null>(null);
  const [modalOpened, { open, close }] = useDisclosure(false);

  const handleOpenDetail = (product: CardDto) => {
    setSelectedProduct(product);
    open();
  };

  return (
    <Box style={{ minHeight: 400 }}>
      {products.length === 0 && !loadingProducts ? (
        <Paper p={50} ta="center" withBorder bg="white" radius="md" shadow="sm">
          <Stack align="center" gap="xs">
            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
              <IconSearch size={30} />
            </ThemeIcon>
            <Text fw={700} size="lg" mt="sm">
              Product not found
            </Text>
            <Text size="sm" c="dimmed" maw={400} mx="auto">
              Sorry, we couldn`t find the product you were looking for. Try using a different keyword or resetting the filter.
            </Text>
            <Button mt="md" variant="light" color="blue" onClick={() => setSearch("")}>
              Clear All Searches
            </Button>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg" verticalSpacing="xl">
          {products.map((item) => (
            <Card
              key={item.id}
              radius="md"
              withBorder
              padding="0"
              shadow="sm"
              style={{
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
                border: "1px solid #edf2f7",
              }}
              className="product-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.borderColor = "var(--mantine-color-blue-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
                e.currentTarget.style.borderColor = "#edf2f7";
              }}
              onClick={() => {
                handleOpenDetail(item);
              }}
            >
              <Card.Section p="xs" style={{ position: "relative" }}>
                {item.stock === 0 && (
                  <Badge
                    color="red.9"
                    variant="filled"
                    style={{ position: "absolute", top: 15, left: 15, zIndex: 5 }}
                    leftSection={<IconPackageOff size={12} />}
                  >
                    Out of Stock
                  </Badge>
                )}

                <AspectRatio ratio={3 / 4} bg="#f8fafc" style={{ borderRadius: "6px", overflow: "hidden" }}>
                  <Image
                    src={getCardImage(item)}
                    alt={item.name}
                    fit="contain"
                    p="sm"
                    loading="lazy"
                    fallbackSrc="https://placehold.co/400x560?text=No+Image"
                  />
                </AspectRatio>
              </Card.Section>

              <Stack justify="space-between" p="md" gap="md" style={{ flex: 1 }}>
                <Box>
                  <Group justify="space-between" align="flex-start" mb={4} wrap="nowrap">
                    <Box style={{ overflow: "hidden" }}>
                      {item.categories?.length > 0 ? (
                        <Text size="xs" c="blue.7" fw={700} style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {item.categories[0].category.name}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed" fw={700}>
                          GENERAL
                        </Text>
                      )}
                    </Box>
                    <Text size="10px" c="dimmed" ff="monospace">
                      #{item.sku || "N/A"}
                    </Text>
                  </Group>

                  <Text size="sm" fw={600} lineClamp={2} mb={4} style={{ lineHeight: 1.4, minHeight: "2.8em" }}>
                    {item.name}
                  </Text>

                  <Group gap={4}>
                    <Box w={6} h={6} style={{ borderRadius: "50%" }} bg={item.stock > 5 ? "teal.5" : item.stock > 0 ? "orange.5" : "red.5"} />
                    <Text size="xs" c="dimmed">
                      {item.stock > 0 ? `${item.stock} unit available` : "Out of Stock"}
                    </Text>
                  </Group>
                </Box>

                <Box>
                  <Stack gap={0} mb="sm">
                    {item.discount && Number(item.discount.value) > 0 && (
                      <Group gap={6}>
                        <Text size="xs" c="dimmed" td="line-through">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </Text>
                        <Badge size="xs" color="red" variant="light" radius="sm">
                          {item.discount.type === "PERCENTAGE" ? `-${item.discount.value}%` : `Saving ${formatRupiah(item.discount.value)}`}
                        </Badge>
                      </Group>
                    )}
                    <Text fw={800} size="xl" c="blue.9">
                      {formatRupiah(item.price)}
                    </Text>
                  </Stack>

                  <Button
                    fullWidth
                    size="sm"
                    radius="xs"
                    color={item.stock === 0 ? "gray" : "dark"}
                    disabled={item.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item, 1);
                    }}
                    loading={loadingAction === item.id}
                    leftSection={item.stock > 0 && <IconShoppingCart size={16} stroke={2.5} />}
                    style={{
                      boxShadow: item.stock > 0 ? "0 4px 12px rgba(0, 68, 148, 0.2)" : "none",
                    }}
                  >
                    {item.stock === 0 ? "Sold out" : "Add to Cart"}
                  </Button>
                </Box>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CardCatalogModal
        opened={modalOpened}
        onClose={close}
        product={selectedProduct}
        handleAddToCart={handleAddToCart}
        loadingAction={loadingAction}
      />
    </Box>
  );
};
