"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Badge, Button, Code, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconPencil, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { MenuForm } from "./MenuForm";
import { Menu } from "@/types/Menu";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";

const ListMenu = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // State Query Parameters
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "order", // Default sort by Order biar rapi
    sortOrder: "asc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchMenus = async () => {
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

      const res = await fetch(`/api/menus?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setMenus(json.data);
        setMetadata(json.metadata);
      } else {
        notifications.show({
          title: "Error",
          message: json.message,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  // --- Handlers ---
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
      title: "Delete Menu",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this menu? This action cannot be undone.</Text>,
      labels: { confirm: "Delete Menu", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Menu deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchMenus();
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
    setSelectedMenu(null);
    open();
  };

  const handleOpenEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    open();
  };

  // --- Columns Definition ---
  const columns: ColumnDef<Menu>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 50,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "code",
      label: "Code",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Text fw={600} size="sm" c="blue">
          {item.code}
        </Text>
      ),
    },
    {
      key: "label",
      label: "Label",
      sortable: true,
      filterable: true,
    },
    {
      key: "icon",
      label: "Icon",
      width: 120,
      render: (item) => (item.icon ? <Code>{item.icon}</Code> : <Text c="dimmed">-</Text>),
    },
    {
      key: "order",
      label: "Order",
      sortable: true,
      width: 80,
      render: (item) => (
        <Badge variant="outline" color="gray">
          {item.order}
        </Badge>
      ),
    },
    {
      key: "url",
      label: "URL Path",
      render: (item) =>
        item.url ? (
          <Text size="sm">{item.url}</Text>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No Link
          </Text>
        ),
    },
    {
      key: "parentCode",
      label: "Parent",
      sortable: true,
      render: (item) =>
        item.parentCode ? (
          <Badge color="cyan" variant="light">
            {item.parentCode}
          </Badge>
        ) : (
          <Badge color="gray" variant="dot">
            ROOT
          </Badge>
        ),
    },
    {
      key: "subMenus",
      label: "Children",
      sortable: false,
      width: 100,
      render: (item) => {
        const count = item.subMenus?.length || 0;
        return count > 0 ? (
          <Badge circle color="teal">
            {count}
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        );
      },
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
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.idMenu)}>
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
        <Title order={3}>List Menu</Title>
        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchMenus} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Menu
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={menus}
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

      <MenuForm
        opened={opened}
        onClose={close}
        menuToEdit={selectedMenu}
        allMenus={menus}
        onSuccess={() => {
          fetchMenus();
        }}
      />
    </Paper>
  );
};

export default ListMenu;
