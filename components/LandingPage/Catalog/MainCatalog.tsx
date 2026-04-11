"use client";

import { useCart } from "@/components/hooks/useCart";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { ListCardSection } from "@/components/LandingPage/ListCardSection";
import { CardDto } from "@/types/dtos/CardDto";
import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Center,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  rem,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconChevronRight, IconFilter, IconFilterOff, IconHome, IconSearch } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "createdAt|desc", label: "Newest" },
  { value: "price|asc", label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "createdAt|asc", label: "Oldest" },
];

export default function MainCatalog() {
  const searchParams = useSearchParams();

  const categoryParams = searchParams.get("category");
  const sortParams = searchParams.get("sort");
  const titleParams = searchParams.get("title");

  const [products, setProducts] = useState<CardDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(categoryParams ? categoryParams.split(";") : []);
  const [selectedFilterStock, setSelectedFilterStock] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<string | null>(sortParams ? sortParams : "createdAt|desc");
  const [activePage, setActivePage] = useState(1);

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

  const handleToggle = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleClearFilter = () => {
    setSelectedCategoryIds([]);
    setSelectedFilterStock(null);
  };

  const breadcumsItem = [
    { title: "Home", href: "/" },
    { title: titleParams || "Collections", href: "#" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      onClick={(e) => {
        if (item.href === "#") e.preventDefault();
      }}
      c={item.href === "#" ? "dark.3" : "dimmed"}
      size="xs"
      fw={700}
      style={{
        textTransform: "uppercase",
        letterSpacing: rem(0.5),
        pointerEvents: item.href === "#" ? "none" : "auto",
      }}
    >
      {item.title === "Home" ? <IconHome size={14} style={{ marginBottom: rem(-2) }} /> : item.title}
    </Anchor>
  ));

  return (
    <Box bg="#f8f9fa" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="xl" py="sm" fluid>
        <Grid>
          <Grid.Col>
            <Breadcrumbs separator={<IconChevronRight size={12} stroke={3} opacity={0.4} />} separatorMargin="xs">
              {breadcumsItem}
            </Breadcrumbs>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3, lg: 2 }}>
            <Paper p="md" radius="xs" withBorder shadow="sm">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconFilter size={18} stroke={2} />
                  <Text fw={700} size="sm">
                    Filter Search
                  </Text>
                </Group>

                <Text size="xs" c="red" style={{ cursor: "pointer" }} onClick={() => handleClearFilter()}>
                  Clear All
                </Text>
              </Group>

              {!categoryParams && (
                <Stack gap="xs">
                  <Text size="sm" fw={700} mb={4}>
                    Categories
                  </Text>

                  {categoriesList.length > 0 ? (
                    categoriesList.map((cat) => (
                      <Checkbox
                        key={cat.name}
                        label={cat.name}
                        checked={selectedCategoryIds.includes(cat.name)}
                        onChange={() => handleToggle(cat.name)}
                        styles={{
                          label: { fontSize: 14, color: "#495057", cursor: "pointer" },
                          input: { cursor: "pointer" },
                        }}
                      />
                    ))
                  ) : (
                    <Text size="xs" c="dimmed">
                      No categories available
                    </Text>
                  )}
                </Stack>
              )}

              <Divider my="md" />

              <Stack gap="xs">
                <Text size="sm" fw={700} mb={4}>
                  Availability
                </Text>
                <Checkbox
                  checked={selectedFilterStock == "on"}
                  onChange={() => setSelectedFilterStock("on")}
                  label="In Stock"
                  styles={{ label: { fontSize: 14, color: "#495057" } }}
                />
                <Checkbox
                  checked={selectedFilterStock == "off"}
                  onChange={() => setSelectedFilterStock("off")}
                  label="Out of Stock"
                  styles={{ label: { fontSize: 14, color: "#495057" } }}
                />
              </Stack>
            </Paper>
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

                {!sortParams && (
                  <Select
                    data={SORT_OPTIONS}
                    value={sortValue}
                    onChange={setSortValue}
                    size="md"
                    radius="md"
                    w={{ base: "100%", sm: 220 }}
                    allowDeselect={false}
                  />
                )}
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
