"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { CategoryCardDto } from "@/types/dtos/CategoryCardDto";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Avatar, Badge, Box, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCategory, IconCheck, IconPencil, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CategoryForm } from "./CategoryForm";

const ListCategory = () => {
  const [categories, setCategories] = useState<CategoryCardDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryCardDto | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchCategories = async () => {
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

      const res = await fetch(`/api/categories?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setCategories(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      title: "Delete Category",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this Category? This action cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Category deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchCategories();
          } else {
            throw new Error(json.message);
          }
        } catch (error: any) {
          notifications.show({ title: "Error", message: error.message || "Network error", color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    open();
  };

  const handleOpenEdit = (item: CategoryCardDto) => {
    setSelectedCategory(item);
    open();
  };

  const columns: ColumnDef<CategoryCardDto>[] = [
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
      render: (item) => (
        <Group gap="sm">
          <Avatar src={item.urlImage || null} radius="sm" size="md" color="blue">
            <IconCategory size={20} />
          </Avatar>
          <Box>
            <Text fw={500} size="sm" style={{ lineHeight: 1.2 }}>
              {item.name}
            </Text>
            <Text size="xs" c="dimmed">
              {item.slug}
            </Text>
          </Box>
        </Group>
      ),
    },
    {
      key: "cards_count",
      label: "Total Cards",
      width: 120,
      render: (item) => (
        <Badge variant="dot" color="blue">
          {item._count?.cards || 0} items
        </Badge>
      ),
    },
    {
      key: "note",
      label: "Note",
      render: (item) => (
        <Text size="xs" lineClamp={2} c={!item.note ? "dimmed" : undefined}>
          {item.note || "-"}
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
        <Title order={3}>Categories Management</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchCategories} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd} variant="filled">
            Add Category
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={categories}
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

      <CategoryForm opened={opened} onClose={close} categoryToEdit={selectedCategory} onSuccess={fetchCategories} />
    </Paper>
  );
};

export default ListCategory;
