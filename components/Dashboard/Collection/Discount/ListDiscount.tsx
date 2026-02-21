"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { DiscountDto } from "@/types/dtos/DiscountDto";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCoin, IconPencil, IconPercentage, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { DiscountForm } from "./DiscountForm";

const ListDiscount = () => {
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountDto | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: queryParams.page.toString(),
        limit: queryParams.limit.toString(),
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      });

      Object.entries(queryParams.filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/discounts?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setDiscounts(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handlePageChange = (page: number) => setQueryParams((p) => ({ ...p, page }));
  const handleLimitChange = (limit: number) => setQueryParams((p) => ({ ...p, limit, page: 1 }));
  const handleSortChange = (key: string, order: "asc" | "desc") => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }));
  const handleFilterChange = (key: string, value: string) => {
    setQueryParams((p) => ({
      ...p,
      page: 1,
      filters: { ...p.filters, [key]: value },
    }));
  };

  const handleDelete = (id: string) => {
    openConfirmModal({
      title: "Delete Discount",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this discount?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Discount deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchDiscounts();
          } else {
            notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
          }
        } catch (error) {
          console.error("Delete error:", error);
          notifications.show({ title: "Error", message: "Network error", color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedDiscount(null);
    open();
  };

  const handleOpenEdit = (discount: DiscountDto) => {
    setSelectedDiscount(discount);
    open();
  };

  const columns: ColumnDef<DiscountDto>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => <Text fw={500}>{item.name}</Text>,
    },
    {
      key: "value",
      label: "Amount",
      sortable: true,
      render: (item) => (
        <Badge
          size="lg"
          variant="light"
          color={item.type === "PERCENTAGE" ? "orange" : "green"}
          leftSection={item.type === "PERCENTAGE" ? <IconPercentage size={14} /> : <IconCoin size={14} />}
        >
          {item.type === "PERCENTAGE" ? `${Number(item.value)}%` : `Rp ${Number(item.value).toLocaleString("id-ID")}`}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (item) => (
        <Group gap={4} justify="center">
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Discount List</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchDiscounts} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Discount
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={discounts}
        columns={columns}
        metadata={metadata}
        loading={loading}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        filterValues={queryParams.filters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      <DiscountForm
        opened={opened}
        onClose={close}
        discountToEdit={selectedDiscount}
        onSuccess={() => {
          fetchDiscounts();
        }}
      />
    </Paper>
  );
};

export default ListDiscount;
