"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Button, Flex, Group, Paper, Select, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEye, IconHistory, IconRefresh, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { TransactionHistoryModal } from "./TransactionHistoryModal";
import { StatusBadge } from "../../layout/StatusBadge";
import { CONSTANT } from "@/constants";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";

interface Transaction {
  id: string;
  invoice: string;
  user: { name: string; email: string } | null;
  customerName: string | null;
  customerEmail: string | null;
  totalPrice: number;
  status: string;
  snapRedirect: string;
  createdAt: string;
  items: any[];
}

const ListTransaction = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null | string, Date | null | string]>([null, null]);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");

  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const [historyOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false);
  const [historyTrx, setHistoryTrx] = useState<{ id: string; invoice: string } | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

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

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTransactions(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, filterStatus]);

  const handleSearch = () => {
    setQueryParams((p) => ({ ...p, page: 1 }));
    fetchTransactions();
  };

  const handleOpenDetail = (item: Transaction) => {
    setSelectedTrx(item);
    openDetail();
  };

  const handleOpenHistory = (item: Transaction) => {
    setHistoryTrx({ id: item.id, invoice: item.invoice });
    openHistory();
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "invoice",
      label: "Invoice",
      sortable: true,
      render: (item) => (
        <Text fw={600} size="sm">
          {item.invoice}
        </Text>
      ),
    },
    {
      key: "user",
      label: "Customer",
      sortable: true,
      render: (item) => (
        <Flex direction="column">
          <Text size="sm" fw={500}>
            {item.customerName || item.user?.name || CONSTANT.ROLE_GUEST_NAME}
          </Text>
          <Text size="xs" c="dimmed">
            {item.customerEmail || "-"}
          </Text>
        </Flex>
      ),
    },
    {
      key: "totalPrice",
      label: "Total",
      sortable: true,
      render: (item) => (
        <Text size="sm" fw={500}>
          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(item.totalPrice))}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (item) => (
        <Text size="xs">
          {new Date(item.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Text>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 160,
      render: (item) => (
        <Group gap={4}>
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenDetail(item)}>
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="View History Log">
            <ActionIcon variant="subtle" color="gray" onClick={() => handleOpenHistory(item)}>
              <IconHistory size={18} />
            </ActionIcon>
          </Tooltip>

          {item.status === "PENDING" && item.snapRedirect && (
            <Button size="xs" variant="filled" color="orange" radius="xs" onClick={() => window.open(item.snapRedirect, "_blank")}>
              Pay Now
            </Button>
          )}
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Transactions</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchTransactions} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Flex>

      <Group mb="md" align="flex-end">
        <TextInput
          label="Search"
          placeholder="Search Invoice..."
          leftSection={<IconSearch size={16} />}
          value={searchInvoice}
          onChange={(e) => setSearchInvoice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Select
          label="Status"
          placeholder="All Status"
          data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
          value={filterStatus}
          onChange={setFilterStatus}
          clearable
        />

        <DatePickerInput
          label="Date Range"
          type="range"
          placeholder="Payment Date"
          value={dateRange}
          onChange={setDateRange}
          clearable
        />

        <Button variant="light" onClick={handleSearch} leftSection={<IconSearch size={16} />}>
          Apply
        </Button>
      </Group>

      <TableComponent
        data={transactions}
        columns={columns}
        metadata={metadata}
        loading={loading}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        filterValues={{}}
        onPageChange={(page) => setQueryParams((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setQueryParams((p) => ({ ...p, limit, page: 1 }))}
        onSortChange={(key, order) => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }))}
        onFilterChange={() => {}}
      />

      <TransactionDetailModal opened={detailOpened} onClose={closeDetail} transaction={selectedTrx} onUpdateSuccess={fetchTransactions} />

      <TransactionHistoryModal
        opened={historyOpened}
        onClose={closeHistory}
        transactionId={historyTrx?.id || null}
        invoice={historyTrx?.invoice || ""}
      />
    </Paper>
  );
};

export default ListTransaction;
