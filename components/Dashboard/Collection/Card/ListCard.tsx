"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Avatar, Badge, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCreditCard, IconPencil, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CardForm } from "./CardForm";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { CardData } from "@/types/CardData";

const ListCard = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchCards = async () => {
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

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setCards(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch cards data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
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
      title: "Delete Card",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this card? This action cannot be undone.</Text>,
      labels: { confirm: "Delete Card", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: json.message || "Card deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchCards();
          } else {
            notifications.show({
              title: "Error",
              message: json.message,
              color: "red",
              icon: <IconX size={16} />,
            });
          }
        } catch (error) {
          console.error("Delete error:", error);
          notifications.show({ title: "Error", message: "Network error", color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedCard(null);
    open();
  };

  const handleOpenEdit = (card: CardData) => {
    setSelectedCard(card);
    open();
  };

  const columns: ColumnDef<CardData>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "image",
      label: "Image",
      sortable: false,
      width: 80,
      render: (item) => {
        const displayImage = item.images.find((img) => img.isPrimary) || item.images[0];
        return (
          <Avatar src={displayImage?.url || null} radius="sm" size="md" color="blue">
            <IconCreditCard size={20} />
          </Avatar>
        );
      },
    },
    {
      key: "name",
      label: "Card Name",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Flex direction="column" gap={2}>
          <Text fw={500}>{item.name}</Text>
          {item.sku && (
            <Text size="xs" c="dimmed">
              SKU: {item.sku}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      key: "categories",
      label: "Categories",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Group gap={4}>
          {item.categories.length > 0 ? (
            item.categories.map((c) => (
              <Badge key={c.category.id} color="cyan" variant="light" size="sm">
                {c.category.name}
              </Badge>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              -
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Text size="sm">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(item.price) || 0)}</Text>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Badge color={item.stock > 5 ? "teal" : item.stock > 0 ? "yellow" : "red"} variant="dot">
          {item.stock} Left
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
        <Title order={3}>Product Cards</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchCards} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Product
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={cards}
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

      <CardForm
        opened={opened}
        onClose={close}
        cardToEdit={selectedCard}
        onSuccess={() => {
          fetchCards();
        }}
      />
    </Paper>
  );
};

export default ListCard;
