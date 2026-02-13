"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { RoleCategoryAccessFormModal } from "./RoleCategoryAccessFormModal";

export interface RoleCategoryAccess {
  id: string;
  roleId: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  role: { id: string; name: string };
  category: { id: string; name: string };
}

const ListRoleCategoryAccess = () => {
  const [accesses, setAccesses] = useState<RoleCategoryAccess[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedAccess, setSelectedAccess] = useState<RoleCategoryAccess | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchAccesses = async () => {
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

      const res = await fetch(`/api/role-category-access?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setAccesses(json.data);
        setMetadata(json.metadata || { total: 0, page: 1, limit: 10, totalPages: 0 });
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      console.error("Error fetching access list:", error);
      notifications.show({ title: "Error", message: error.message || "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchAccesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleOpenCreate = () => {
    setSelectedAccess(null);
    open();
  };

  const handleOpenEdit = (access: RoleCategoryAccess) => {
    setSelectedAccess(access);
    open();
  };

  const handleDelete = (access: RoleCategoryAccess) => {
    modals.openConfirmModal({
      title: "Revoke Access",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to revoke <strong>{access.role.name}</strong> access to <strong>{access.category.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Revoke", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/role-category-access/${access.id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok) {
            notifications.show({ title: "Success", message: "Access revoked successfully", color: "green" });
            fetchAccesses();
          } else {
            throw new Error(json.message);
          }
        } catch (error: any) {
          notifications.show({ title: "Error", message: error.message, color: "red" });
        }
      },
    });
  };

  const columns: ColumnDef<RoleCategoryAccess>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "role.name",
      label: "Role",
      sortable: false,
      render: (item) => (
        <Text fw={600} size="sm">
          {item.role.name}
        </Text>
      ),
    },
    {
      key: "category.name",
      label: "Category Access",
      sortable: false,
      render: (item) => <Text size="sm">{item.category.name}</Text>,
    },
    {
      key: "createdAt",
      label: "Assigned At",
      sortable: true,
      render: (item) => (
        <Text size="xs">{new Date(item.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</Text>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 120,
      render: (item) => (
        <Group gap={4}>
          <Tooltip label="Manage all accesses for this role">
            <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Revoke this specific category">
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item)}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Role Access Management</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchAccesses} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
            Assign New Access
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={accesses}
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

      <RoleCategoryAccessFormModal opened={opened} onClose={close} access={selectedAccess} onSuccess={fetchAccesses} />
    </Paper>
  );
};

export default ListRoleCategoryAccess;
