"use client";

import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { MyTransactionDetailModal } from "@/components/MyTransaction/MyTransactionDetailModal";
import { MyTransactionHistoryModal } from "@/components/MyTransaction/MyTransactionHistoryModal";
import { CartItemDto } from "@/types/dtos/CartItemDto";
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
  Group,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconCreditCard,
  IconEye,
  IconFilter,
  IconHistory,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconSearchOff,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const MyTransaction = ({ isNonDashboard = false }: { isNonDashboard: boolean }) => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 12, sortBy: "createdAt", sortOrder: "desc" as "asc" | "desc" });

  const [selectedTrx, setSelectedTrx] = useState<TransactionDto | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const handleOpenDetail = (trx: TransactionDto) => {
    setSelectedTrx(trx);
    setDetailOpened(true);
  };

  const handleOpenHistory = (trx: TransactionDto) => {
    setSelectedTrx(trx);
    setHistoryOpened(true);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: queryParams.page.toString(),
        limit: queryParams.limit.toString(),
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      });

      if (filterStatus) params.append("status", filterStatus);
      if (searchInvoice) params.append("invoice", searchInvoice);
      if (dateRange[0]) params.append("startDate", dayjs(dateRange[0]).startOf("day").toISOString());
      if (dateRange[1]) params.append("endDate", dayjs(dateRange[1]).endOf("day").toISOString());

      const url = isNonDashboard ? `/api/users/transactions?${params}` : `/api/transactions?${params}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setTransactions(json.data);
        setMetadata(json.metadata);
      }
    } catch {
      notifications.show({ title: "Error", message: "Gagal memuat data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  return (
    <Box bg="gray.0" mih="100vh">
      <HeaderSection cartItems={[] as CartItemDto[]} />

      <Container size="xl" py="xl">
        <Stack mb="xl">
          <Flex justify="space-between" align="flex-end" wrap="wrap" gap="md">
            <Box>
              <Title order={3} fw={800} c="#1e1b4b">
                Transaction List
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Monitor your order status and shopping history
              </Text>
            </Box>
            <Button
              variant="white"
              color="blue"
              bd="1px solid"
              leftSection={<IconRefresh size={18} />}
              onClick={fetchTransactions}
              loading={loading}
              radius="md"
            >
              Refresh
            </Button>
          </Flex>

          <Paper p="md" radius="md" withBorder shadow="xs">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} verticalSpacing="xs">
              <TextInput
                label="Search Invoice"
                placeholder="Example: INV/2026/..."
                leftSection={<IconSearch size={16} />}
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
              />
              <Select
                label="Status"
                placeholder="All status"
                clearable
                data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
                value={filterStatus}
                onChange={setFilterStatus}
              />
              <DatePickerInput
                label="Filter Date"
                type="range"
                placeholder="Select Date"
                value={dateRange as any}
                onChange={setDateRange as any}
                clearable
              />
              <Flex align="flex-end">
                <Button fullWidth leftSection={<IconFilter size={18} />} onClick={() => setQueryParams((p) => ({ ...p, page: 1 }))}>
                  Filter
                </Button>
              </Flex>
            </SimpleGrid>
          </Paper>
        </Stack>

        {loading ? (
          <Center py={100}>
            <Stack align="center">
              <IconRefresh className="animate-spin" size={40} color="blue" />
              <Text fw={600}>Menyinkronkan data...</Text>
            </Stack>
          </Center>
        ) : transactions.length === 0 ? (
          <Center py={100}>
            <Stack align="center" gap={0}>
              <IconSearchOff size={50} color="gray" />
              <Text fw={700} size="xl" mt="md">
                Transaksi tidak ditemukan
              </Text>
              <Text c="dimmed">Coba ubah filter atau cari invoice lain</Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {transactions.map((item) => (
              <Paper
                key={item.id}
                withBorder
                p="lg"
                radius="lg"
                shadow="sm"
                style={{ transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
              >
                {/* Header Card */}
                <Group justify="space-between" mb="md">
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} mb={2}>
                      INVOICE
                    </Text>
                    <Badge variant="dot" color="blue" radius="xs" size="lg" px={0} bd={"none"} styles={{ label: { textTransform: "none" } }}>
                      {item.invoice}
                    </Badge>
                  </Box>
                  <StatusBadge status={item.status} />
                </Group>

                <Divider mb="md" variant="dotted" />

                {/* Main Content */}
                <Stack gap="sm">
                  <Flex justify="space-between" align="center">
                    <Group gap="xs">
                      <IconPackage size={18} color="#228be6" />
                      <Text size="sm" fw={600} truncate maw={180}>
                        {item.items?.[0]?.productName || "Produk Digital"}
                      </Text>
                    </Group>
                    {item.items.length > 1 && (
                      <Badge variant="light" color="gray">
                        +{item.items.length - 1} item
                      </Badge>
                    )}
                  </Flex>

                  <Group gap="xs">
                    <IconCalendar size={16} color="gray" />
                    <Text size="xs" c="dimmed" fw={500}>
                      {dayjs(item.createdAt).format("DD MMMM YYYY • HH:mm")}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconCreditCard size={16} color="gray" />
                    <Text size="xs" c="dimmed" fw={600}>
                      {item.paymentMethod || "-"}
                    </Text>
                  </Group>
                </Stack>

                <Box mt="md" p="xs" bg="blue.0" style={{ borderRadius: "8px" }}>
                  <Flex justify="space-between" align="center">
                    <Text size="xs" c="blue.8" fw={700}>
                      TOTAL
                    </Text>
                    <Text fw={900} size="lg" c="blue.9">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                        Number(item.totalPrice)
                      )}
                    </Text>
                  </Flex>
                </Box>

                <Group mt="lg" gap="sm">
                  {item.status === "PENDING" && item.snapRedirect && (
                    <Button color="orange" flex={1} radius="md" onClick={() => window.open(item.snapRedirect!, "_blank")}>
                      Pay now
                    </Button>
                  )}
                  <Button variant="light" flex={1} radius="md" leftSection={<IconEye size={16} />} onClick={() => handleOpenDetail(item)}>
                    Detail
                  </Button>
                  <Tooltip label="Riwayat Status">
                    <ActionIcon variant="default" size="lg" radius="md" onClick={() => handleOpenHistory(item)}>
                      <IconHistory size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        )}

        <Flex justify="center" mt={50} direction="column" align="center" gap="md">
          <Pagination
            total={metadata.totalPages}
            value={metadata.page}
            onChange={(page) => setQueryParams((p) => ({ ...p, page }))}
            color="blue"
            radius="md"
            withEdges
          />
          <Text size="xs" c="dimmed">
            Displays {transactions.length} of {metadata.total} transactions
          </Text>
        </Flex>
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
