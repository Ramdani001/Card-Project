"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ShopDto } from "@/types/dtos/ShopDto";
import { ActionIcon, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPencil, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ShopForm } from "./ShopForm";

const ListShop = () => {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const buildQuery = () => {
    const params = new URLSearchParams({
      page: String(queryParams.page),
      limit: String(queryParams.limit),
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    Object.entries(queryParams.filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    return params.toString();
  };

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shops?${buildQuery()}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      setShops(json.data);
      setMetadata(json.metadata);
    } catch (err: any) {
      console.error("Fetch error:", err);
      notifications.show({
        title: "Error",
        message: err.message || "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const updateQuery = (updates: Partial<typeof queryParams>) => {
    setQueryParams((prev) => ({ ...prev, ...updates }));
  };

  const handlePageChange = (page: number) => updateQuery({ page });
  const handleLimitChange = (limit: number) => updateQuery({ limit, page: 1 });

  const handleSortChange = (key: string, order: "asc" | "desc") => updateQuery({ sortBy: key, sortOrder: order });

  const handleFilterChange = (key: string, value: string) =>
    updateQuery({
      page: 1,
      filters: { ...queryParams.filters, [key]: value },
    });

  const handleDelete = (id: string) => {
    openConfirmModal({
      title: "Delete Shop",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this shop? This action cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/shops/${id}`, {
            method: "DELETE",
          });
          const json = await res.json();

          if (!json.success) throw new Error(json.message);

          notifications.show({
            title: "Success",
            message: "Shop deleted successfully",
            color: "teal",
            icon: <IconCheck size={16} />,
          });

          fetchShops();
        } catch (err: any) {
          notifications.show({
            title: "Error",
            message: err.message || "Network error",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedShop(null);
    open();
  };

  const handleOpenEdit = (shop: ShopDto) => {
    setSelectedShop(shop);
    open();
  };

  const columns: ColumnDef<ShopDto>[] = [
    {
      key: "no",
      label: "No",
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      filterable: true,
      width: 300,
      render: (item) => (
        <Text fw={500} size="sm" style={{ lineHeight: 1.2 }}>
          {item.name}
        </Text>
      ),
    },
    {
      key: "address",
      label: "Address",
      filterable: true,
      render: (item) => (
        <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
          {item.address}, {item.villageName}, {item.subDistrictName},
          <br />
          {item.cityName}, {item.provinceName}, {item.postalCode}
        </Text>
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
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Shops</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchShops} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>

          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Shop
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={shops}
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

      <ShopForm opened={opened} onClose={close} shopToEdit={selectedShop} onSuccess={fetchShops} />
    </Paper>
  );
};

export default ListShop;
