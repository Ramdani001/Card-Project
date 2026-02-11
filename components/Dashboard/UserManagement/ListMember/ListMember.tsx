"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Avatar, Badge, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPencil, IconPhone, IconRefresh, IconTrash, IconUserPlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ListMemberForm } from "./ListMemberForm";

export interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  isActive: boolean;
  roleId: string | null;
  role: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
}

const ListMember = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchUsers = async () => {
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

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setUsers(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notifications.show({ title: "Error", message: "Failed to fetch users", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      if (json.success) setRolesList(json.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(() => {
    fetchRoles();
  }, []);

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
      title: "Delete Confirmation",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this user? This action cannot be undone.</Text>,
      labels: { confirm: "Delete User", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "User deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchUsers();
          } else {
            notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
          }
        } catch (error) {
          console.error("Delete error:", error);
          notifications.show({ title: "Error", message: "Network error", color: "red" });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    open();
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    open();
  };

  const columns: ColumnDef<User>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (item) => (
        <Group gap="sm">
          <Avatar src={item.image} radius="xl" color="blue" />
          <Flex direction="column">
            <Text size="sm" fw={500}>
              {item.name || "No Name"}
            </Text>
            <Text size="xs" c="dimmed">
              {item.email}
            </Text>
          </Flex>
        </Group>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (item) => (
        <Group gap={4}>
          <IconPhone size={14} style={{ opacity: 0.5 }} />
          <Text size="sm">{item.phone || "-"}</Text>
        </Group>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: false,
      render: (item) =>
        item.role ? (
          <Badge color="blue" variant="light">
            {item.role.name}
          </Badge>
        ) : (
          <Badge color="gray" variant="outline">
            Guest
          </Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (item) => (
        <Text size="xs" c="dimmed">
          {new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
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
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>List Member</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchUsers} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconUserPlus size={18} />} onClick={handleOpenAdd}>
            Add User
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={users}
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

      <ListMemberForm
        opened={opened}
        onClose={close}
        rolesList={rolesList}
        userToEdit={selectedUser}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </Paper>
  );
};

export default ListMember;
