"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { CONSTANT } from "@/constants";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import { ActionIcon, Button, Checkbox, Flex, Group, Paper, Select, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEye, IconHistory, IconRefresh, IconSearch, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../layout/StatusBadge";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { TransactionHistoryModal } from "./TransactionHistoryModal";
import { TransactionStatus } from "@/prisma/generated/prisma/enums";

const ListTransaction = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cancellingBatch, setCancellingBatch] = useState(false);
  const statusOptions = Object.values(TransactionStatus);

  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null | string, Date | null | string]>([null, null]);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchGlobal, setSearchGlobal] = useState("");

  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [selectedTrx, setSelectedTrx] = useState<TransactionDto>();

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

      if (searchGlobal) params.append("search", searchGlobal);

      if (dateRange[0]) params.append("startDate", dayjs(dateRange[0]).startOf("day").toISOString());
      if (dateRange[1]) params.append("endDate", dayjs(dateRange[1]).endOf("day").toISOString());

      const urlListTransaction = `/api/transactions?${params.toString()}`;
      const res = await fetch(urlListTransaction);
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

  const handleBatchCancel = () => {
    if (selectedIds.length === 0) return;

    openConfirmModal({
      title: "Batch Cancel Transactions",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to cancel <b>{selectedIds.length}</b> selected transactions? This action will restore item stocks and revert voucher
          usages.
        </Text>
      ),
      labels: { confirm: "Cancel Transactions", cancel: "Back" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setCancellingBatch(true);
        try {
          const res = await fetch("/api/transactions/batch-cancel", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds, note: "Cancelled via Admin Bulk Action" }),
          });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: json.message || "Transactions cancelled successfully",
              color: "teal",
            });
            fetchTransactions();
          } else {
            throw new Error(json.message || "Failed to cancel transactions");
          }
        } catch (error: any) {
          notifications.show({
            title: "Cancel Error",
            message: error.message,
            color: "red",
            icon: <IconX size={16} />,
          });
        } finally {
          setCancellingBatch(false);
        }
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = transactions.map((trx) => trx.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleOpenDetail = (item: TransactionDto) => {
    setSelectedTrx(item);
    openDetail();
  };

  const handleOpenHistory = (item: TransactionDto) => {
    setHistoryTrx({ id: item.id, invoice: item.invoice });
    openHistory();
  };

  const columns: ColumnDef<TransactionDto>[] = [
    {
      key: "selection",
      label: (
        <Checkbox
          checked={transactions.length > 0 && selectedIds.length === transactions.length}
          indeterminate={selectedIds.length > 0 && selectedIds.length < transactions.length}
          onChange={(event) => handleSelectAll(event.currentTarget.checked)}
        />
      ),
      sortable: false,
      width: 45,
      render: (item) => (
        <Checkbox checked={selectedIds.includes(item.id)} onChange={(event) => handleSelectRow(item.id, event.currentTarget.checked)} />
      ),
    },
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
        <Text component="span" fw={600} size="sm">
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
        <Group gap="md">
          <Title order={3}>Transactions</Title>
          {selectedIds.length > 0 && (
            <Button color="red" variant="light" size="xs" leftSection={<IconX size={14} />} onClick={handleBatchCancel} loading={cancellingBatch}>
              Cancel Selected ({selectedIds.length})
            </Button>
          )}
        </Group>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchTransactions} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Flex>

      <Group mb="md" align="flex-end">
        <TextInput
          label="Search"
          placeholder="Invoice, name, or email..."
          leftSection={<IconSearch size={16} />}
          value={searchGlobal}
          onChange={(e) => setSearchGlobal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          miw={220}
        />

        <Select label="Status" placeholder="All Status" data={statusOptions} value={filterStatus} onChange={setFilterStatus} clearable />

        <DatePickerInput label="Date Range" type="range" placeholder="Payment Date" value={dateRange} onChange={setDateRange} clearable miw={240} />

        <Button variant="light" onClick={handleSearch} leftSection={<IconSearch size={16} />}>
          Apply
        </Button>
      </Group>

      <TableComponent
        data={transactions}
        columns={columns}
        metadata={metadata}
        loading={loading || cancellingBatch}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        filterValues={{}}
        onPageChange={(page) => setQueryParams((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setQueryParams((p) => ({ ...p, limit, page: 1 }))}
        onSortChange={(key, order) => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }))}
        onFilterChange={() => {}}
      />

      {selectedTrx && (
        <TransactionDetailModal opened={detailOpened} onClose={closeDetail} transaction={selectedTrx} onUpdateSuccess={fetchTransactions} />
      )}

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
