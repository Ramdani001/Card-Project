"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { ActionIcon, Box, Button, Flex, Group, Image, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPencil, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Banner, BannerForm } from "./BannerForm";

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const ListBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: queryParams.page.toString(),
        limit: queryParams.limit.toString(),
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      });

      const res = await fetch(`/api/banners?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setBanners(json.data);

        setMetadata(json.metadata || { total: json.data.length, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      notifications.show({ title: "Error", message: "Failed to fetch banners", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handlePageChange = (page: number) => setQueryParams((p) => ({ ...p, page }));
  const handleLimitChange = (limit: number) => setQueryParams((p) => ({ ...p, limit, page: 1 }));
  const handleSortChange = (key: string, order: "asc" | "desc") => setQueryParams((p) => ({ ...p, sortBy: key, sortOrder: order }));

  const handleDelete = (id: string) => {
    openConfirmModal({
      title: "Delete Banner",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this banner? This action cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Banner deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchBanners();
          } else {
            notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
          }
        } catch (error) {
          console.error("Delete error:", error);
          notifications.show({ title: "Error", message: "Network error", color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setSelectedBanner(null);
    open();
  };

  const handleOpenEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    open();
  };

  const columns: ColumnDef<Banner>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "url",
      label: "Banner Preview",
      sortable: false,
      render: (item) => (
        <Group gap="sm" wrap="nowrap">
          <Image src={item.url} radius="sm" h={50} w={90} fit="cover" alt="Banner" fallbackSrc="https://placehold.co/90x50?text=Error" />

          <Box style={{ maxWidth: 200 }}>
            <Text size="sm" fw={500} truncate>
              {(item as any).originalName || "Banner Image"}
            </Text>
            <Text size="xs" c="dimmed">
              {(item as any).size ? formatSize((item as any).size) : "-"}
            </Text>
          </Box>
        </Group>
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      sortable: true,
      render: (item) => (
        <Flex direction="column">
          <Text size="xs" c="dimmed">
            Start:{" "}
            <Text span c="dark" fw={500}>
              {new Date(item.startDate).toLocaleDateString("id-ID")}
            </Text>
          </Text>
          <Text size="xs" c="dimmed">
            End: &nbsp;
            <Text span c="dark" fw={500}>
              {new Date(item.endDate).toLocaleDateString("id-ID")}
            </Text>
          </Text>
        </Flex>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (item) => (
        <Group gap={4} justify="center">
          <Tooltip label="Edit Dates/Image">
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
        <Title order={3}>Banner Management</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchBanners} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Upload Banner
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={banners}
        columns={columns}
        metadata={metadata}
        loading={loading}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSortChange={handleSortChange}
        onFilterChange={() => {}}
      />

      <BannerForm
        opened={opened}
        onClose={close}
        bannerToEdit={selectedBanner}
        onSuccess={() => {
          fetchBanners();
        }}
      />
    </Paper>
  );
};

export default ListBanner;
