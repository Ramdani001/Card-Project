"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Button, Flex, Group, Paper, Select, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEye, IconRefresh, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { StatusBadge } from "../layout/StatusBadge";

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
  const [metadata, setMetadata] = useState<PaginationMetaData>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const fetchTransactions = async () => {
    setLoading(true);
    const id = "80a6de75-9749-42de-96e6-88ff50e41e92";
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
    open();
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
      width: 140,
      render: (item) => (
        <Group gap={4}>
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenDetail(item)}>
            <IconEye size={18} />
          </ActionIcon>

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

      <TransactionDetailModal opened={opened} onClose={close} transaction={selectedTrx} onUpdateSuccess={fetchTransactions} />
    </Paper>
  );
};

export default ListTransaction;
