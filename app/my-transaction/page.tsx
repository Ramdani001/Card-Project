"use client";

import { useCart } from "@/components/hooks/useCart";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { MyTransactionDetailModal } from "@/components/MyTransaction/MyTransactionDetailModal";
import { MyTransactionHistoryModal } from "@/components/MyTransaction/MyTransactionHistoryModal";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconCreditCard, IconEye, IconFilter, IconHistory, IconPackage, IconPlus, IconSearchOff } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const MyTransaction = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [activePage, setActivePage] = useState(1);

  const [selectedTrx, setSelectedTrx] = useState<TransactionDto | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const { cartItems, setCartItems, loadingCart } = useCart();

  const fetchTransactions = async (page: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (filterStatus) params.append("status", filterStatus);
      if (searchInvoice) params.append("invoice", searchInvoice);
      if (dateRange[0]) params.append("startDate", dayjs(dateRange[0]).startOf("day").toISOString());
      if (dateRange[1]) params.append("endDate", dayjs(dateRange[1]).endOf("day").toISOString());

      const res = await fetch(`/api/users/transactions?${params}`);
      const json = await res.json();

      if (json.success) {
        setTransactions((prev) => (isInitial ? json.data : [...prev, ...json.data]));
        setHasMore(page < json.metadata.totalPages);
      }
    } catch {
      notifications.show({ title: "Error", message: "Gagal memuat data", color: "red" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleApplyFilter = () => {
    setActivePage(1);
    fetchTransactions(1, true);
  };

  const handleResetFilter = () => {
    setSearchInvoice("");
    setFilterStatus(null);
    setDateRange([null, null]);
    setActivePage(1);
    fetchTransactions(1, true);
  };

  const handleLoadMore = () => {
    const nextPage = activePage + 1;
    setActivePage(nextPage);
    fetchTransactions(nextPage, false);
  };

  useEffect(() => {
    fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box bg="#fcfcfd" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container fluid py={rem(40)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Stack>
              <Box mb="md">
                <Title order={2} fw={900} c="dark.7" lts={-0.5}>
                  My Orders
                </Title>
                <Text size="sm" c="dimmed">
                  Track and manage your transaction history
                </Text>
              </Box>

              <Paper p="xl" radius="md" withBorder shadow="sm">
                <Stack gap="lg">
                  <Group gap="xs">
                    <IconFilter size={18} stroke={2} />
                    <Text fw={700} size="sm">
                      Filter Search
                    </Text>
                  </Group>

                  <Divider />

                  <TextInput
                    label="Invoice Number"
                    placeholder="e.g. INV/2026/..."
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    radius="md"
                  />

                  <Select
                    label="Transaction Status"
                    placeholder="Select status"
                    clearable
                    data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    radius="md"
                  />

                  <DatePickerInput
                    label="Date Range"
                    type="range"
                    placeholder="Pick dates"
                    value={dateRange as any}
                    onChange={setDateRange as any}
                    clearable
                    radius="md"
                  />

                  <Stack gap="xs" mt="md">
                    <Button fullWidth radius="md" color="dark" onClick={handleApplyFilter} loading={loading && activePage === 1}>
                      Apply Filter
                    </Button>
                    <Button fullWidth variant="subtle" color="gray" radius="md" size="sm" onClick={handleResetFilter}>
                      Reset All
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            {loading && transactions.length === 0 ? (
              <Center h={400}>
                <Stack align="center" gap="xs">
                  <Loader size="lg" color="dark" type="dots" />
                  <Text fw={500} size="sm" c="dimmed">
                    Fetching your records...
                  </Text>
                </Stack>
              </Center>
            ) : transactions.length === 0 ? (
              <Paper radius="md" withBorder p={80} bg="white">
                <Center h="100%">
                  <Stack align="center" gap="xs">
                    <IconSearchOff size={48} stroke={1.5} color="var(--mantine-color-gray-4)" />
                    <Text fw={700} size="lg">
                      No transactions found
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                      We couldn`t find any orders matching your current filters.
                    </Text>
                    <Button variant="light" color="gray" mt="md" onClick={handleResetFilter}>
                      Clear all filters
                    </Button>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              <Stack gap="xl">
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                  {transactions.map((item) => (
                    <Paper
                      key={item.id}
                      withBorder
                      p="lg"
                      radius="md"
                      className="transaction-card"
                      style={{
                        transition: "all 0.2s ease",
                        cursor: "default",
                      }}
                    >
                      <Group justify="space-between" mb="md" align="flex-start">
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed" fw={700} lts={0.5} tt="uppercase">
                            Invoice Number
                          </Text>
                          <Text fw={800} size="md" c="blue.8">
                            {item.invoice}
                          </Text>
                        </Stack>
                        <StatusBadge status={item.status} />
                      </Group>

                      <Divider mb="md" variant="dashed" />

                      <Stack gap="sm" mb="lg">
                        <Group gap="sm" wrap="nowrap">
                          <ThemeIconIconWrapper icon={<IconPackage size={16} />} color="blue" />
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={700} truncate>
                              {item.items?.[0]?.productName || "Product"}
                            </Text>
                            {item.items.length > 1 && (
                              <Text size="xs" c="dimmed">
                                +{item.items.length - 1} other products
                              </Text>
                            )}
                          </Box>
                        </Group>

                        <Group gap="sm">
                          <ThemeIconIconWrapper icon={<IconCalendar size={16} />} color="gray" />
                          <Text size="xs" c="gray.7" fw={500}>
                            {dayjs(item.createdAt).format("DD MMM YYYY, HH:mm")}
                          </Text>
                        </Group>

                        <Group gap="sm">
                          <ThemeIconIconWrapper icon={<IconCreditCard size={16} />} color="gray" />
                          <Text size="xs" c="gray.7" fw={500}>
                            {item.paymentMethod || "Standard Payment"}
                          </Text>
                        </Group>
                      </Stack>

                      <Paper withBorder p="sm" radius="md" bg="gray.0" mb="md">
                        <Flex justify="space-between" align="center">
                          <Text size="xs" fw={800} c="dimmed">
                            TOTAL PAID
                          </Text>
                          <Text fw={900} size="lg" c="dark">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(Number(item.totalPrice))}
                          </Text>
                        </Flex>
                      </Paper>

                      <Group gap="sm">
                        <Button
                          variant="outline"
                          color="dark"
                          flex={1}
                          radius="md"
                          size="sm"
                          leftSection={<IconEye size={16} />}
                          onClick={() => {
                            setSelectedTrx(item);
                            setDetailOpened(true);
                          }}
                        >
                          View Detail
                        </Button>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          size={36}
                          radius="md"
                          onClick={() => {
                            setSelectedTrx(item);
                            setHistoryOpened(true);
                          }}
                        >
                          <IconHistory size={18} />
                        </ActionIcon>
                        {item.status === "PENDING" && item.snapRedirect && (
                          <Button color="orange" radius="md" size="sm" onClick={() => window.open(item.snapRedirect!, "_blank")}>
                            Pay Now
                          </Button>
                        )}
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>

                <Center mt="xl" pb="xl">
                  {hasMore ? (
                    <Button
                      variant="outline"
                      color="dark"
                      radius="xs"
                      px={40}
                      size="md"
                      loading={loadingMore}
                      onClick={handleLoadMore}
                      leftSection={!loadingMore && <IconPlus size={16} />}
                    >
                      Load More
                    </Button>
                  ) : (
                    <Stack gap={4} align="center">
                      <Divider w={100} color="gray.3" />
                      <Text size="xs" c="dimmed" fs="italic">
                        All {transactions.length} transactions loaded
                      </Text>
                    </Stack>
                  )}
                </Center>
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      </Container>

      <MyTransactionDetailModal opened={detailOpened} onClose={() => setDetailOpened(false)} transaction={selectedTrx} />
      <MyTransactionHistoryModal
        opened={historyOpened}
        onClose={() => setHistoryOpened(false)}
        statusLogs={selectedTrx?.statusLogs}
        invoice={selectedTrx?.invoice || ""}
        transactionId={selectedTrx?.id}
      />

      <FooterSection />
    </Box>
  );
};

// Helper Component untuk icon yang lebih konsisten
const ThemeIconIconWrapper = ({ icon, color }: { icon: React.ReactNode; color: string }) => (
  <Center
    style={{
      width: rem(28),
      height: rem(28),
      borderRadius: rem(6),
      backgroundColor: `var(--mantine-color-${color}-light)`,
    }}
  >
    <Box c={`${color}.7`} style={{ display: "flex" }}>
      {icon}
    </Box>
  </Center>
);

export default MyTransaction;
