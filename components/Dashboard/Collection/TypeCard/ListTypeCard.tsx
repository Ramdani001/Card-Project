"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconPlus, IconTrash, IconId, IconX, IconCheck } from "@tabler/icons-react";
import { TableComponent, ColumnDef } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { TypeCard } from "@/types/TypeCard";
import { TypeCardForm } from "./TypeCardForm";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";

const ListTypeCard = () => {
  const [typeCards, setTypeCards] = useState<TypeCard[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTypeCard, setSelectedTypeCard] = useState<TypeCard | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchTypeCards = async () => {
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

      const res = await fetch(`/api/type-cards?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTypeCards(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching type cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypeCards();
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

  const handleDelete = (id: number) => {
    openConfirmModal({
      title: "Delete Type Card",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this Type Card? This action cannot be undone.</Text>,
      labels: { confirm: "Delete Type", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/type-cards/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Type Card deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchTypeCards();
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
          notifications.show({
            title: "Error",
            message: "Network error occurred",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedTypeCard(null);
    open();
  };

  const handleOpenEdit = (item: TypeCard) => {
    setSelectedTypeCard(item);
    open();
  };

  const columns: ColumnDef<TypeCard>[] = [
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
      filterable: true,
      render: (item) => (
        <Badge size="md" variant="light" color="indigo" leftSection={<IconId size={12} />}>
          {item.name}
        </Badge>
      ),
    },
    {
      key: "note",
      label: "Note",
      sortable: true,
      filterable: true,
      render: (item) => <Text size="sm">{item.note || "-"}</Text>,
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (item) => (
        <Group gap={4} justify="center">
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.idTypeCard)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Type Cards</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
          Add Type
        </Button>
      </Flex>

      <TableComponent
        data={typeCards}
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

      <TypeCardForm
        opened={opened}
        onClose={close}
        typeCardToEdit={selectedTypeCard}
        onSuccess={() => {
          fetchTypeCards();
        }}
      />
    </Paper>
  );
};

export default ListTypeCard;
