"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaDataDto } from "@/types/PaginationMetaDataDto";
import { RoleDto } from "@/types/RoleDto";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { RoleFormModal } from "./RoleFormModal";

const ListRole = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

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
      notifications.show({ title: "Error", message: error.message || "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handlePageChange = (page: number) => setQueryParams((p) => ({ ...p, page }));
  const handleLimitChange = (limit: number) => setQueryParams((p) => ({ ...p, limit, page: 1 }));
  const handleSortChange = (key: string, order: "asc" | "desc") => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }));
  const handleFilterChange = (key: string, value: string) => {
    setQueryParams((p) => ({ ...p, page: 1, filters: { ...p.filters, [key]: value } }));
  };

  const handleOpenCreate = () => {
    setSelectedRole(null);
    open();
  };
  const handleOpenEdit = (role: RoleDto) => {
    setSelectedRole(role);
    open();
  };

  const handleDelete = (role: RoleDto) => {
    if (role._count && role._count.users > 0) {
      notifications.show({ title: "Cannot Delete", message: "This role is assigned to users.", color: "orange" });
      return;
    }

    modals.openConfirmModal({
      title: "Delete Role",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{role.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
          if (res.ok) {
            notifications.show({ title: "Success", message: "Role deleted", color: "green" });
            fetchRoles();
          }
        } catch (error: any) {
          notifications.show({ title: "Error", message: error.message, color: "red" });
        }
      },
    });
  };

  const columns: ColumnDef<RoleDto>[] = [
    {
      key: "no",
      label: "No",
      width: 50,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "name",
      label: "Role Name",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Text fw={700} size="sm">
          {item.name}
        </Text>
      ),
    },
    {
      key: "usersCount",
      label: "Users",
      width: 100,
      render: (item) => (
        <Badge color={item._count?.users ? "blue" : "gray"} variant="light">
          {item._count?.users || 0}
        </Badge>
      ),
    },
    {
      key: "apiAccess",
      label: "API Access",
      render: (item) => {
        const accesses = item.roleApiAccesses || [];
        const limit = 2;
        const hasMore = accesses.length > limit;

        return (
          <Group gap={4}>
            {accesses.length > 0 ? (
              <>
                {accesses.slice(0, limit).map((access, idx) => {
                  const crud = [
                    access.canRead ? "R" : "-",
                    access.canCreate ? "C" : "-",
                    access.canUpdate ? "U" : "-",
                    access.canDelete ? "D" : "-",
                  ].join(" ");

                  return (
                    <Tooltip key={idx} label={`Permissions: ${crud}`} withArrow>
                      <Badge variant="dot" color="indigo" size="sm" tt="none">
                        {access.apiEndpoints.url}
                      </Badge>
                    </Tooltip>
                  );
                })}
                {hasMore && (
                  <Badge variant="outline" color="gray" size="sm">
                    +{accesses.length - limit} more
                  </Badge>
                )}
              </>
            ) : (
              <Text size="xs" c="dimmed" fs="italic">
                No API Access
              </Text>
            )}
          </Group>
        );
      },
    },
    {
      key: "categoryAccess",
      label: "Category",
      render: (item) => (
        <Group gap={4}>
          {(item.cardCategoryRoleAccesses || []).slice(0, 2).map((a: any) => (
            <Badge key={a.category.id} variant="light" color="cyan" size="sm">
              {a.category.name}
            </Badge>
          ))}
          {(item.cardCategoryRoleAccesses?.length || 0) > 2 && (
            <Text size="xs" c="dimmed">
              ...
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: "menuAccess",
      label: "Menu",
      render: (item) => (
        <Group gap={4}>
          {(item.roleMenuAccesses || []).slice(0, 2).map((a: any) => (
            <Badge key={a.menu.id} variant="light" color="teal" size="sm">
              {a.menu.label}
            </Badge>
          ))}
          {(item.roleMenuAccesses?.length || 0) > 2 && (
            <Text size="xs" c="dimmed">
              ...
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 100,
      render: (item) => (
        <Group gap={4}>
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item)} disabled={!!item._count?.users}>
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
