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
      render: (item) => (
        <Text fw={600} size="sm">
          {item.invoice}
        </Text>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (item) => (
        <Flex direction="column">
          <Text size="sm" fw={500}>
            {item.customerName || item.user?.name || "Guest"}
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
      render: (item) => (
        <Text size="sm" fw={500}>
          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(item.totalPrice))}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      label: "Date",
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

      <Group mb="md">
        <TextInput
          placeholder="Search Invoice..."
          leftSection={<IconSearch size={16} />}
          value={searchInvoice}
          onChange={(e) => setSearchInvoice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Select
          placeholder="Filter Status"
          data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
          value={filterStatus}
          onChange={setFilterStatus}
          clearable
        />
        <Button variant="light" onClick={handleSearch}>
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
