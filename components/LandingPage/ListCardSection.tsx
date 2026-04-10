import { CardDto } from "@/types/dtos/CardDto";
import { Badge, Box, Button, Card, Group, Image, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

interface ListCardSectionProps {
  loadingProducts: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
  setSelectedCategoryIds?: Dispatch<SetStateAction<string[]>>;
  products: CardDto[];
  handleAddToCart: (product: CardDto) => Promise<void>;
  loadingAction: string | null;
}

export const ListCardSection = ({ loadingProducts, products, setSearch, handleAddToCart, loadingAction }: ListCardSectionProps) => {
  const getCardImage = (item: CardDto) => item.images?.[0]?.url || "https://placehold.co/400x560?text=No+Image";

  return (
    <Box style={{ minHeight: 400, position: "relative" }}>
      {products.length === 0 && !loadingProducts ? (
        <Paper p="xl" ta="center" withBorder bg="white" radius="xs">
          <IconSearch size={40} color="gray" style={{ marginBottom: 10 }} />
          <Text fw={500}>No products found.</Text>
          <Text size="sm" c="dimmed">
            Try adjusting your search or filters.
          </Text>
          <Button
            mt="md"
            variant="outline"
            onClick={() => {
              setSearch("");
            }}
          >
            Clear Search
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md" verticalSpacing="lg">
          {products.map((item) => (
            <Card
              key={item.id}
              padding="0"
              radius="xs"
              withBorder
              bg="white"
              style={{
                border: "1px solid #e4e8ed",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                overflow: "hidden",
                minHeight: 360,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 40, 75, 0.18)";
                e.currentTarget.style.borderColor = "#a8b8ce";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e4e8ed";
              }}
            >
              <Card.Section style={{ position: "relative", borderBottom: "1px solid #f1f3f5" }}>
                {item.stock === 0 && (
                  <Badge color="gray" radius="xs" variant="filled" style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                    Sold Out
                  </Badge>
                )}

                <Box p="md" bg="white" h={240} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    src={getCardImage(item)}
                    alt={item.name}
                    fit="contain"
                    h="100%"
                    w="auto"
                    fallbackSrc="https://placehold.co/300x420?text=No+Image"
                  />
                </Box>
              </Card.Section>

              <Stack gap={8} p="md" h="auto" justify="space-between" bg="white">
                <Box>
                  <Group gap={6} mb={4}>
                    {(item.categories?.length ?? 0) > 0 ? (
                      item.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat.category.id} color="blue" variant="light" radius="xs" size="xs" style={{ textTransform: "uppercase" }}>
                          {cat.category.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge color="gray" variant="light" radius="xs" size="xs" style={{ textTransform: "uppercase" }}>
                        General
                      </Badge>
                    )}
                    {item.categories?.length > 3 && (
                      <Text size="xs" c="dimmed" mt={2}>
                        +{item.categories.length - 3} more
                      </Text>
                    )}
                  </Group>

                  <Text size="sm" fw={700} lineClamp={2} mt="2px" title={item.name} style={{ minHeight: 42 }}>
                    {item.name}
                  </Text>

                  <Text size="xs" c="dimmed" lineClamp={1}>
                    SKU: {item.sku || "-"}
                  </Text>

                  <Text size="xs" c={item.stock > 0 ? "teal" : "red"} fw={700} mt="4px">
                    {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                  </Text>
                </Box>

                <Box>
                  <Group align="center" mb={8}>
                    <Text fw={800} size="lg" c="blue">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </Text>
                    {item.discount && Number(item.discount.value) > 0 && (
                      <Text size="xs" c="red" fw={700}>
                        -
                        {item.discount.type === "PERCENTAGE"
                          ? `${item.discount.value}%`
                          : `Rp ${Number(item.discount.value).toLocaleString("id-ID")}`}
                      </Text>
                    )}
                  </Group>

                  <Button
                    fullWidth
                    radius="xs"
                    size="xs"
                    color={item.stock === 0 ? "gray" : "dark"}
                    disabled={item.stock === 0}
                    onClick={() => handleAddToCart(item)}
                    loading={loadingAction === item.id}
                    leftSection={item.stock > 0 ? <IconShoppingCart size={14} /> : undefined}
                  >
                    {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Box>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};
