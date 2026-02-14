"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { Voucher } from "@/types/Voucher"; // Pastikan path sesuai
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Badge, Button, Code, CopyButton, Flex, Group, Paper, Progress, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCoin, IconCopy, IconPencil, IconPercentage, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { VoucherForm } from "./VoucherForm";

const ListVoucher = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: queryParams.page.toString(),
        limit: queryParams.limit.toString(),
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      });

      if (queryParams.filters.search) params.append("search", queryParams.filters.search);

      const res = await fetch(`/api/vouchers?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setVouchers(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleDelete = (id: string) => {
    openConfirmModal({
      title: "Delete Voucher",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this voucher? This action cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/vouchers/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({ title: "Success", message: "Voucher deleted", color: "teal", icon: <IconCheck size={16} /> });
            fetchVouchers();
          } else {
            notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
          }
        } catch {
          notifications.show({ title: "Error", message: "Network error", color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  };

  const getStatus = (start: string | Date, end: string | Date) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) return { label: "Expired", color: "red" };
    if (now < startDate) return { label: "Scheduled", color: "yellow" };
    return { label: "Active", color: "green" };
  };

  const columns: ColumnDef<Voucher>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "code",
      label: "Voucher Info",
      sortable: true,
      render: (item) => (
        <Flex direction="column" gap={4}>
          <Group gap={6}>
            <Code fw={700} fz="sm" color="blue">
              {item.code}
            </Code>
            <CopyButton value={item.code} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                  <ActionIcon color={copied ? "teal" : "gray"} variant="subtle" onClick={copy} size="xs">
                    {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {item.name}
          </Text>
        </Flex>
      ),
    },
    {
      key: "value",
      label: "Discount",
      sortable: true,
      render: (item) => (
        <Flex direction="column" gap={2}>
          <Badge
            variant="light"
            color={item.type === "PERCENTAGE" ? "orange" : "green"}
            leftSection={item.type === "PERCENTAGE" ? <IconPercentage size={12} /> : <IconCoin size={12} />}
          >
            {item.type === "PERCENTAGE" ? `${Number(item.value)}%` : `Rp ${Number(item.value).toLocaleString("id-ID")}`}
          </Badge>
          {item.minPurchase && (
            <Text size="xs" c="dimmed">
              Min: {Number(item.minPurchase).toLocaleString("id-ID")}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (item) => {
        const percentage = item.stock ? (item.usedCount / item.stock) * 100 : 0;
        return (
          <Tooltip label={`${item.usedCount} used / ${item.stock || "∞"} stock`}>
            <Flex direction="column" gap={4} w={100}>
              <Text size="xs" fw={500}>
                {item.usedCount} / {item.stock || "∞"}
              </Text>
              {item.stock && <Progress value={percentage} size="sm" color={percentage >= 100 ? "red" : "blue"} />}
            </Flex>
          </Tooltip>
        );
      },
    },
    {
      key: "validity",
      label: "Validity",
      sortable: true,
      render: (item) => {
        const status = getStatus(item.startDate, item.endDate);
        return (
          <Flex direction="column" gap={4}>
            <Badge size="sm" color={status.color} variant="dot">
              {status.label}
            </Badge>
            <Text size="xs" c="dimmed">
              {new Date(item.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (item) => (
        <Group gap={4} justify="center">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => {
              setSelectedVoucher(item);
              open();
            }}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Voucher List</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchVouchers} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              setSelectedVoucher(null);
              open();
            }}
          >
            Add Voucher
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={vouchers}
        columns={columns}
        metadata={metadata}
        loading={loading}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        onPageChange={(page) => setQueryParams((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setQueryParams((p) => ({ ...p, limit, page: 1 }))}
        onSortChange={(key, order) => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }))}
        onFilterChange={(key, value) => setQueryParams((p) => ({ ...p, page: 1, filters: { ...p.filters, [key]: value } }))}
      />

      <VoucherForm
        opened={opened}
        onClose={close}
        voucherToEdit={selectedVoucher}
        onSuccess={() => {
          fetchVouchers();
          close();
        }}
      />
    </Paper>
  );
};

export default ListVoucher;
