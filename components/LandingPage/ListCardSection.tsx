import { CardData } from "@/types/CardData";
import { Badge, Box, Button, Card, Group, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Image } from "@mantine/core";
import { IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

interface ListCardSectionProps {
  loadingProducts: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
  setSelectedCategoryIds?: Dispatch<SetStateAction<string[]>>;
  products: CardData[];
  handleAddToCart: (product: CardData) => Promise<void>;
  loadingAction: string | null;
}

export const ListCardSection = ({ loadingProducts, products, setSearch, handleAddToCart, loadingAction }: ListCardSectionProps) => {
  // Helper Functions (Internal component helpers)
  const getCardImage = (item: CardData) => item.images?.[0]?.url || "https://placehold.co/400x560?text=No+Image";

  return (
    <Box style={{ minHeight: 400, position: "relative" }}>
      <LoadingOverlay visible={loadingProducts} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

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
              // setSelectedCategoryIds([]); // Jika ada akses ke state filter
            }}
          >
            Clear Search
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md" verticalSpacing="lg">
          {products.map((item) => (
            <Card
              key={item.id} // UUID
              padding="0"
              radius="xs"
              withBorder
              bg="white"
              style={{
                border: "1px solid #dee2e6",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#adb5bd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#dee2e6";
              }}
            >
              <Card.Section style={{ position: "relative", borderBottom: "1px solid #f1f3f5" }}>
                {item.stock === 0 && (
                  <Badge color="gray" radius="xs" variant="filled" style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                    Sold Out
                  </Badge>
                )}

                {/* Sale Badge (Logic diskon opsional) */}
                {/* {hasDiscount(item) && (
                    <Badge color="red" radius="xs" variant="filled" style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
                      Sale
                    </Badge>
                )} */}

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

              <Stack gap={6} p="sm" h={160} justify="space-between" bg="white">
                <Box>
                  <Text size="10px" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 0.5 }}>
                    {item.categories?.[0]?.category?.name || "General"}
                  </Text>
                  <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.3, minHeight: 38 }} title={item.name}>
                    {item.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {item.sku || " "}
                  </Text>
                </Box>

                <Box>
                  <Group gap={5} align="flex-end" mb={8}>
                    <Text fw={800} size="md" c="blue">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </Text>
                  </Group>
                  <Button
                    fullWidth
                    radius="xs"
                    size="xs"
                    color="dark"
                    disabled={item.stock === 0}
                    onClick={() => handleAddToCart(item)}
                    loading={loadingAction === item.id}
                    leftSection={item.stock > 0 && <IconShoppingCart size={14} />}
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
