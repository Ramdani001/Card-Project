"use client";

import { useCart } from "@/components/hooks/useCart";
import { FilterSection } from "@/components/LandingPage/FilterSection";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { CardDto } from "@/types/dtos/CardDto";
import { Box, Button, Center, Container, Grid, Group, Loader, Paper, rem, Select, Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconFilterOff, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "createdAt|desc", label: "Newest" },
  { value: "price|asc", label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "createdAt|asc", label: "Oldest" },
];

export default function MainCatalog() {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedFilterStock, setSelectedFilterStock] = useState<string>("on");
  const [sortValue, setSortValue] = useState<string | null>("createdAt|desc");
  const [activePage, setActivePage] = useState(1);

  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const { cartItems, handleAddToCart, loadingAction, loadingCart, setCartItems } = useCart();

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success) setCategoriesList(json.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async (page: number, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoadingProducts(true);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "8");
      if (debouncedSearch) params.append("name", debouncedSearch);
      if (sortValue) {
        const [field, direction] = sortValue.split("|");
        params.append("sortBy", field);
        params.append("sortOrder", direction);
      }
      if (selectedCategoryIds.length > 0) params.append("categories", selectedCategoryIds.join(","));
      if (selectedFilterStock) params.append("stock", selectedFilterStock);

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setProducts((prev) => (page === 1 ? json.data : [...prev, ...json.data]));
        setHasMore(page < json.metadata.totalPages);
      } else {
        if (page === 1) setProducts([]);
        setHasMore(false);
      }
    } catch {
      notifications.show({ title: "Error", message: "Failed to load products.", color: "red" });
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  };

  // Reset filter dan fetch ulang dari page 1
  useEffect(() => {
    setActivePage(1);
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryIds, sortValue, selectedFilterStock]);

  const handleLoadMore = () => {
    const nextPage = activePage + 1;
    setActivePage(nextPage);
    fetchProducts(nextPage, true);
  };

  return (
    <Box bg="#f8f9fa" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="xl" py="xl" fluid>
        <Grid>
          <Grid.Col span={{ base: 12, md: 3, lg: 2 }}>
            <FilterSection
              categories={categoriesList}
              selectedCategoryIds={selectedCategoryIds}
              setSelectedCategoryIds={setSelectedCategoryIds}
              setSelectedFilterStock={setSelectedFilterStock}
              selectedFilterStock={selectedFilterStock}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9, lg: 10 }}>
            <Stack gap="lg">
              <Group justify="space-between">
                <TextInput
                  placeholder="Search..."
                  leftSection={<IconSearch size={18} stroke={1.5} color="#909296" />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  size="md"
                  radius="md"
                  style={{ flex: 1 }}
                  maw={{ base: "100%", sm: 450 }}
                />
                <Select
                  data={SORT_OPTIONS}
                  value={sortValue}
                  onChange={setSortValue}
                  size="md"
                  radius="md"
                  w={{ base: "100%", sm: 220 }}
                  allowDeselect={false}
                />
              </Group>

              <Box mih={500}>
                {products.length > 0 ? (
                  <Stack gap="xl">
                    <ListCardSection
                      products={products}
                      handleAddToCart={handleAddToCart}
                      loadingAction={loadingAction}
                      setSearch={setSearch}
                      loadingProducts={loadingProducts}
                    />

                    <Center>
                      {hasMore ? (
                        <Button
                          variant="outline"
                          color="dark"
                          size="md"
                          radius="xs"
                          onClick={handleLoadMore}
                          loading={loadingMore}
                          styles={{
                            root: {
                              borderWidth: rem(1.5),
                              fontWeight: 600,
                              transition: "transform 0.2s ease",
                              "&:active": { transform: "scale(0.95)" },
                            },
                          }}
                        >
                          View More
                        </Button>
                      ) : (
                        !loadingProducts && (
                          <Text size="sm" c="dimmed" fs="italic">
                            You`ve reached the end of the catalog.
                          </Text>
                        )
                      )}
                    </Center>
                  </Stack>
                ) : (
                  <Paper withBorder radius="md" p={100}>
                    <Center>
                      {loadingProducts ? (
                        <Stack align="center">
                          <Loader color="blue" size="xl" type="dots" />
                          <Text size="sm" c="dimmed">
                            Loading products...
                          </Text>
                        </Stack>
                      ) : (
                        <Stack align="center" gap="xs">
                          <IconFilterOff size={48} color="#dee2e6" />
                          <Text fw={600} c="gray.6">
                            No products found
                          </Text>
                          <Text size="sm" c="dimmed">
                            Try adjusting your search or filters
                          </Text>
                        </Stack>
                      )}
                    </Center>
                  </Paper>
                )}
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      <FooterSection />
    </Box>
  );
}
