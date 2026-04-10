"use client";

import { useCart } from "@/components/hooks/useCart";
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { MyTransactionDetailModal } from "@/components/MyTransaction/MyTransactionDetailModal";
import { MyTransactionHistoryModal } from "@/components/MyTransaction/MyTransactionHistoryModal";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import {
  ActionIcon,
  Badge,
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
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useIntersection } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconCreditCard, IconEye, IconFilter, IconHistory, IconPackage, IconSearch, IconSearchOff } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const MyTransaction = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [_metadata, setMetadata] = useState<PaginationMetaDataDto>({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [activePage, setActivePage] = useState(1);

  const [selectedTrx, setSelectedTrx] = useState<TransactionDto | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const { cartItems, setCartItems, loadingCart } = useCart();

  const viewportRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: viewportRef.current,
    threshold: 0.1,
  });

  const handleOpenDetail = (trx: TransactionDto) => {
    setSelectedTrx(trx);
    setDetailOpened(true);
  };

  const handleOpenHistory = (trx: TransactionDto) => {
    setSelectedTrx(trx);
    setHistoryOpened(true);
  };

  const fetchTransactions = async (page: number, isInitial: boolean = false) => {
    setLoading(true);
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

      const url = `/api/users/transactions?${params}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setTransactions((prev) => (isInitial ? json.data : [...prev, ...json.data]));
        setMetadata(json.metadata);
        setHasMore(page < json.metadata.totalPages);
      }
    } catch {
      notifications.show({ title: "Error", message: "Gagal memuat data", color: "red" });
    } finally {
      setLoading(false);
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
    // Kita panggil manual karena state update bersifat async
    setTransactions([]);
    setHasMore(true);
    fetchTransactions(1, true);
  };

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loading && transactions.length > 0) {
      const nextPage = activePage + 1;
      setActivePage(nextPage);
      fetchTransactions(nextPage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.isIntersecting]);

  useEffect(() => {
    fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box bg="#f8f9fa" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="xl" py="xl" fluid>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Stack style={{ position: "sticky", top: 20 }}>
              <Box>
                <Title order={3} fw={800} c="#1e1b4b">
                  Transactions
                </Title>
                <Text size="xs" c="dimmed">
                  Manage and track your orders
                </Text>
              </Box>

              <Paper p="md" radius="xs" withBorder shadow="sm">
                <Stack gap="md">
                  <Group gap="xs">
                    <IconFilter size={20} color="blue" />
                    <Text fw={700} size="sm">
                      Filters
                    </Text>
                  </Group>

                  <Divider variant="dashed" />

                  <TextInput
                    label="Invoice Number"
                    labelProps={{ style: { fontSize: "12px", marginBottom: "4px" } }}
                    placeholder="INV/2026/..."
                    leftSection={<IconSearch size={14} />}
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    radius="xs"
                  />

                  <Select
                    label="Transaction Status"
                    labelProps={{ style: { fontSize: "12px", marginBottom: "4px" } }}
                    placeholder="All Status"
                    clearable
                    data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    radius="xs"
                  />

                  <DatePickerInput
                    label="Date Range"
                    labelProps={{ style: { fontSize: "12px", marginBottom: "4px" } }}
                    type="range"
                    placeholder="Pick dates"
                    value={dateRange as any}
                    onChange={setDateRange as any}
                    clearable
                    radius="xs"
                  />

                  <Stack gap="xs" mt="md">
                    <Button fullWidth radius="md" onClick={handleApplyFilter} loading={loading && activePage === 1}>
                      Apply Filter
                    </Button>
                    <Button fullWidth variant="subtle" color="gray" radius="md" size="xs" onClick={handleResetFilter}>
                      Reset Filter
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Paper radius="xs" withBorder shadow="sm" bg="white">
              <ScrollArea h={800} viewportRef={viewportRef}>
                <Box p="lg">
                  {loading && transactions.length === 0 ? (
                    <Center h={400}>
                      <Stack align="center">
                        <Loader size={40} color="blue" />
                        <Text fw={600} size="sm">
                          Loading transactions...
                        </Text>
                      </Stack>
                    </Center>
                  ) : transactions.length === 0 ? (
                    <Center h={400}>
                      <Stack align="center" gap={0}>
                        <IconSearchOff size={50} color="gray" />
                        <Text fw={700} size="lg" mt="md">
                          No transactions found
                        </Text>
                        <Text c="dimmed" size="sm">
                          Try adjusting your filters
                        </Text>
                      </Stack>
                    </Center>
                  ) : (
                    <Stack gap="lg">
                      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                        {transactions.map((item) => (
                          <Paper
                            key={item.id}
                            withBorder
                            p="md"
                            radius="xs"
                            style={{
                              transition: "transform 0.2s",
                              backgroundColor: "#fff",
                            }}
                            className="hover-card"
                          >
                            <Group justify="space-between" mb="xs">
                              <Box>
                                <Text size="10px" c="dimmed" fw={700} style={{ letterSpacing: "0.5px" }}>
                                  INVOICE
                                </Text>
                                <Text fw={700} size="sm" c="blue.7">
                                  {item.invoice}
                                </Text>
                              </Box>
                              <StatusBadge status={item.status} />
                            </Group>

                            <Divider mb="sm" variant="dotted" />

                            <Stack gap={8}>
                              <Flex justify="space-between" align="center">
                                <Group gap={8}>
                                  <IconPackage size={16} color="#228be6" />
                                  <Text size="sm" fw={600} truncate maw={150}>
                                    {item.items?.[0]?.productName || "Digital Product"}
                                  </Text>
                                </Group>
                                {item.items.length > 1 && (
                                  <Badge variant="light" color="gray" size="xs">
                                    +{item.items.length - 1} more
                                  </Badge>
                                )}
                              </Flex>

                              <Group gap={8}>
                                <IconCalendar size={14} color="gray" />
                                <Text size="xs" c="dimmed">
                                  {dayjs(item.createdAt).format("DD MMM YYYY • HH:mm")}
                                </Text>
                              </Group>

                              <Group gap={8}>
                                <IconCreditCard size={14} color="gray" />
                                <Text size="xs" c="dimmed" fw={500}>
                                  {item.paymentMethod || "-"}
                                </Text>
                              </Group>
                            </Stack>

                            <Box mt="sm" p="8px" bg="blue.0" style={{ borderRadius: "6px" }}>
                              <Flex justify="space-between" align="center">
                                <Text size="10px" c="blue.8" fw={800}>
                                  TOTAL AMOUNT
                                </Text>
                                <Text fw={800} size="md" c="blue.9">
                                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                                    Number(item.totalPrice)
                                  )}
                                </Text>
                              </Flex>
                            </Box>

                            <Group mt="md" gap="xs">
                              <Button
                                variant="light"
                                flex={1}
                                radius="md"
                                size="xs"
                                leftSection={<IconEye size={14} />}
                                onClick={() => handleOpenDetail(item)}
                              >
                                Detail
                              </Button>
                              <ActionIcon variant="default" size="30px" radius="md" onClick={() => handleOpenHistory(item)}>
                                <IconHistory size={16} />
                              </ActionIcon>
                              {item.status === "PENDING" && item.snapRedirect && (
                                <Button color="orange" radius="md" size="xs" onClick={() => window.open(item.snapRedirect!, "_blank")}>
                                  Pay
                                </Button>
                              )}
                            </Group>
                          </Paper>
                        ))}
                      </SimpleGrid>

                      <div ref={ref} style={{ height: 20 }}>
                        {hasMore ? (
                          <Center py="md">
                            <Loader color="blue" type="dots" size="sm" />
                          </Center>
                        ) : (
                          <Center py="md">
                            <Text size="xs" c="dimmed">
                              You`ve reached the end of the list ({transactions.length} transactions)
                            </Text>
                          </Center>
                        )}
                      </div>
                    </Stack>
                  )}
                </Box>
              </ScrollArea>
            </Paper>
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

export default MyTransaction;
