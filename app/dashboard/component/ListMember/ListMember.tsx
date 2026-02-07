"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconTrash, IconUserPlus } from "@tabler/icons-react";
import { TableComponent, ColumnDef } from "@/components/layout/TableComponent";
import { ListMemberForm } from "./ListMemberForm";
import { UserData } from "@/types/UserData";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { Role } from "@/types/Role";

const ListMember = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) fetchUsers();
      else alert(json.message);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    open();
  };

  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    open();
  };

  const columns: ColumnDef<UserData>[] = [
    {
      key: "",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      filterable: true,
      render: (item) =>
        item.role ? (
          <Badge color="blue" variant="light">
            {item.role.name}
          </Badge>
        ) : (
          <Badge color="gray">No Role</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Joined Date",
      sortable: true,
      render: (item) => (
        <span suppressHydrationWarning>
          {new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "idUsr",
      label: "Actions",
      width: 100,
      render: (item) => (
        <Group gap={4} justify="center">
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.idUsr)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>List Member</Title>
        <Button leftSection={<IconUserPlus size={18} />} onClick={handleOpenAdd}>
          Add User
        </Button>
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
