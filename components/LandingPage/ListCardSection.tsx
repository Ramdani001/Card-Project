import { CardData } from "@/types/CardData";
import { Badge, Box, Button, Card, Group, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Image } from "@mantine/core";
import { IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

interface ListCardSectionProps {
  loadingProducts: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
  setSelectedTypes: Dispatch<SetStateAction<string[]>>;
  filteredProducts: CardData[];
  getCardName: (item: CardData) => string;
  getCardPrice: (item: CardData) => number;
  getCardStock: (item: CardData) => number;
  getCardType: (item: CardData) => string;
  handleAddToCart: (product: CardData) => Promise<void>;
  loadingAction: number | null;
}

export const ListCardSection = ({
  loadingProducts,
  setSelectedTypes,
  filteredProducts,
  setSearch,
  getCardName,
  getCardPrice,
  getCardStock,
  getCardType,
  handleAddToCart,
  loadingAction,
}: ListCardSectionProps) => {
  const getCardImage = (item: CardData) => item?.detail?.image?.location || "https://placehold.co/400x560?text=No+Image";
  const getDiscountValue = (item: CardData) => Number(item?.detail?.discount?.discount || 0);
  const hasDiscount = (item: CardData) => getDiscountValue(item) > 0;

  return (
    <Box style={{ minHeight: 400 }}>
      <LoadingOverlay visible={loadingProducts} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

      {filteredProducts.length === 0 && !loadingProducts ? (
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
              setSelectedTypes([]);
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md" verticalSpacing="lg">
          {filteredProducts.map((item) => (
            <Card
              key={item.idCard}
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
                {getCardStock(item) === 0 ? (
                  <Badge color="gray" radius="xs" variant="filled" style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                    Sold Out
                  </Badge>
                ) : (
                  hasDiscount(item) && (
                    <Badge color="red" radius="xs" variant="filled" style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
                      Sale
                    </Badge>
                  )
                )}

                <Box p="md" bg="white" h={240} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    src={getCardImage(item)}
                    alt={getCardName(item)}
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
                    {getCardType(item)}
                  </Text>
                  <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.3, minHeight: 38 }} title={getCardName(item)}>
                    {getCardName(item)}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {item?.detail?.note || " "}
                  </Text>
                </Box>

                <Box>
                  <Group gap={5} align="flex-end" mb={8}>
                    <Text fw={800} size="md" c="blue">
                      Rp {getCardPrice(item).toLocaleString("id-ID")}
                    </Text>
                    {hasDiscount(item) && (
                      <Text size="xs" td="line-through" c="dimmed" mb={2}>
                        Rp {(getCardPrice(item) + getDiscountValue(item)).toLocaleString("id-ID")}
                      </Text>
                    )}
                  </Group>
                  <Button
                    fullWidth
                    radius="xs"
                    size="xs"
                    color="dark"
                    disabled={getCardStock(item) === 0}
                    onClick={() => handleAddToCart(item)}
                    loading={loadingAction === item.idCard}
                    leftSection={getCardStock(item) > 0 && <IconShoppingCart size={14} />}
                  >
                    {getCardStock(item) === 0 ? "Out of Stock" : "Add to Cart"}
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
