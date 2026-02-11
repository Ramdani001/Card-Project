"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { RoleFormModal } from "./RoleFormModal";

export interface Role {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
  };
}

const ListRole = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchRoles = async () => {
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

      const res = await fetch(`/api/roles?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setRoles(json.data);
        setMetadata(json.metadata || { total: 0, page: 1, limit: 10, totalPages: 0 });
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
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
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    open();
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    open();
  };

  const handleDelete = (role: Role) => {
    if (role._count && role._count.users > 0) {
      notifications.show({
        title: "Cannot Delete",
        message: "This role is assigned to one or more users.",
        color: "orange",
      });
      return;
    }

    modals.openConfirmModal({
      title: "Delete Role",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the role <strong>{role.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok) {
            notifications.show({ title: "Success", message: "Role deleted successfully", color: "green" });
            fetchRoles();
          } else {
            throw new Error(json.message);
          }
        } catch (error: any) {
          notifications.show({ title: "Error", message: error.message, color: "red" });
        }
      },
    });
  };

  const columns: ColumnDef<Role>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "name",
      label: "Role Name",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Text fw={600} size="sm">
          {item.name}
        </Text>
      ),
    },
    {
      key: "usersCount",
      label: "Users Assigned",
      sortable: true,
      render: (item) => (
        <Badge color={item._count?.users ? "blue" : "gray"} variant="light">
          {item._count?.users || 0} Users
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
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
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item)} disabled={item._count?.users ? item._count.users > 0 : false}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>Roles Management</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchRoles} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
            Add Role
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={roles}
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

      <RoleFormModal opened={opened} onClose={close} role={selectedRole} onSuccess={fetchRoles} />
    </Paper>
  );
};

export default ListRole;
