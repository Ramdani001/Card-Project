"use client";

import { useCart } from "@/components/hooks/useCart";
import { FilterSection } from "@/components/LandingPage/FilterSection";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { CardDto } from "@/types/dtos/CardDto";
import { Box, Center, Container, Grid, Group, Loader, Paper, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue, useIntersection } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconFilterOff, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const SORT_OPTIONS = [
  { value: "createdAt|desc", label: "Newest" },
  { value: "price|asc", label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "createdAt|asc", label: "Oldest" },
];

export default function MainCatalog() {
  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedFilterStock, setSelectedFilterStock] = useState<string>("on");
  const [sortValue, setSortValue] = useState<string | null>("createdAt|desc");
  const [activePage, setActivePage] = useState(1);

  const viewportRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: viewportRef.current,
    threshold: 0.1,
  });

  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const { cartItems, handleAddToCart, loadingAction, loadingCart, setCartItems } = useCart();

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

  const fetchProducts = async (page: number) => {
    setLoadingProducts(true);
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
    }
  };

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loadingProducts) {
      const nextPage = activePage + 1;
      setActivePage(nextPage);
      fetchProducts(nextPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.isIntersecting]);

  // Reset filter
  useEffect(() => {
    setActivePage(1);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryIds, sortValue, selectedFilterStock]);

  return (
    <Box bg="#f8f9fa" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="xl" py="xl" fluid>
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <FilterSection
              categories={categoriesList}
              selectedCategoryIds={selectedCategoryIds}
              setSelectedCategoryIds={setSelectedCategoryIds}
              setSelectedFilterStock={setSelectedFilterStock}
              selectedFilterStock={selectedFilterStock}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="lg">
              <Group justify="space-between" wrap="wrap">
                <TextInput
                  placeholder="Search..."
                  leftSection={<IconSearch size={18} stroke={1.5} color="#909296" />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  size="md"
                  radius="xs"
                  style={{ flex: 1 }}
                  maw={{ base: "100%", sm: 450 }}
                />
                <Select
                  data={SORT_OPTIONS}
                  value={sortValue}
                  onChange={setSortValue}
                  size="md"
                  radius="xs"
                  w={{ base: "100%", sm: 200 }}
                  allowDeselect={false}
                />
              </Group>

              <Paper p="md" radius="xs" withBorder shadow="sm">
                <ScrollArea h={600} viewportRef={viewportRef}>
                  <Box p="md">
                    {products.length > 0 ? (
                      <Stack gap="xl">
                        <ListCardSection
                          products={products}
                          handleAddToCart={handleAddToCart}
                          loadingAction={loadingAction}
                          setSearch={setSearch}
                          loadingProducts={loadingProducts}
                        />

                        <div ref={ref} style={{ height: 20, marginTop: 20 }}>
                          {hasMore && (
                            <Center pb="xl">
                              <Loader color="blue" type="dots" />
                            </Center>
                          )}
                        </div>

                        {!hasMore && (
                          <Center py="md">
                            <Text size="sm" c="dimmed">
                              You`ve reached the end of the catalog.
                            </Text>
                          </Center>
                        )}
                      </Stack>
                    ) : (
                      <Center h={400}>
                        {loadingProducts ? (
                          <Loader color="blue" size="xl" type="dots" />
                        ) : (
                          <Stack align="center" gap="xs">
                            <IconFilterOff size={48} color="#dee2e6" />
                            <Text fw={600} c="dimmed">
                              Product not found.
                            </Text>
                          </Stack>
                        )}
                      </Center>
                    )}
                  </Box>
                </ScrollArea>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      <FooterSection />
    </Box>
  );
}
