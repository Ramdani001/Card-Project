"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { ArticleDto } from "@/types/dtos/ArticleDto";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Avatar, Badge, Box, Button, Flex, Group, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconCheck, IconPencil, IconPhoto, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ArticleForm } from "./ArticleForm";

const ListArticle = () => {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDto | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchArticles = async () => {
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

      const res = await fetch(`/api/articles?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setArticles(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      notifications.show({ title: "Error", message: "Failed to fetch articles", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
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
      title: "Delete Article",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this article?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Article deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchArticles();
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
    setSelectedArticle(null);
    open();
  };

  const handleOpenEdit = (article: ArticleDto) => {
    setSelectedArticle(article);
    open();
  };

  const columns: ColumnDef<ArticleDto>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "title",
      label: "Article Info",
      sortable: true,
      render: (item) => (
        <Group gap="sm">
          <Avatar src={item.images[0]?.url || null} radius="sm" size="md" color="blue">
            <IconCalendar size={20} />
          </Avatar>
          <Box>
            <Text fw={500} size="sm">
              {item.title}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {item.slug}
            </Text>
          </Box>
        </Group>
      ),
    },
    {
      key: "images",
      label: "Gallery",
      sortable: false,
      render: (item) => {
        const count = item.images?.length || 0;
        return count > 0 ? (
          <Badge color="grape" variant="light" leftSection={<IconPhoto size={12} />}>
            {count} Pics
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
        <Title order={3}>List Article</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchArticles} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Article
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={articles}
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

      <ArticleForm
        opened={opened}
        onClose={close}
        articleToEdit={selectedArticle}
        onSuccess={() => {
          fetchArticles();
        }}
      />
    </Paper>
  );
};

export default ListArticle;
