"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { CardDto } from "@/types/dtos/CardDto";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Avatar, Badge, Button, Checkbox, FileButton, Flex, Group, Menu, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconCreditCard,
  IconDownload,
  IconFileSpreadsheet,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CardForm } from "./CardForm";

const ListCard = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const [cards, setCards] = useState<CardDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBatch, setDeletingBatch] = useState(false);

  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/cards/export/template";
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      window.location.href = "/api/cards/export";
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async (file: File | null) => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cards/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        notifications.show({
          title: "Import Success",
          message: json.message,
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        fetchCards();
      } else {
        throw new Error(json.message || "Import failed");
      }
    } catch (error: any) {
      notifications.show({
        title: "Import Error",
        message: error.message,
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

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
        setSelectedIds([]);
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

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;

    openConfirmModal({
      title: "Delete Multiple Cards",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{selectedIds.length}</b> selected cards? This action will permanently remove them from the system.
        </Text>
      ),
      labels: { confirm: "Delete Selected", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setDeletingBatch(true);
        try {
          const res = await fetch("/api/cards/batch", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Batch Delete Success",
              message: json.message || `${selectedIds.length} cards deleted successfully.`,
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchCards();
          } else {
            throw new Error(json.message || "Failed to delete cards");
          }
        } catch (error: any) {
          notifications.show({
            title: "Delete Error",
            message: error.message,
            color: "red",
            icon: <IconX size={16} />,
          });
        } finally {
          setDeletingBatch(false);
        }
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = cards.map((card) => card.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleOpenAdd = () => {
    setSelectedCard(null);
    open();
  };

  const handleOpenEdit = (card: CardDto) => {
    setSelectedCard(card);
    open();
  };

  const columns: ColumnDef<CardDto>[] = [
    {
      key: "selection",
      label: (
        <Checkbox
          checked={cards.length > 0 && selectedIds.length === cards.length}
          indeterminate={selectedIds.length > 0 && selectedIds.length < cards.length}
          onChange={(event) => handleSelectAll(event.currentTarget.checked)}
        />
      ),
      sortable: false,
      width: 45,
      render: (item) => (
        <Checkbox checked={selectedIds.includes(item.id)} onChange={(event) => handleSelectRow(item.id, event.currentTarget.checked)} />
      ),
    },
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "image",
      label: "Images",
      sortable: false,
      width: 100,
      render: (item) => {
        const primaryImage = item.images?.find((img) => img.isPrimary) || item.images?.[0];
        const totalImages = item.images?.length || 0;
        const remainingCount = totalImages - 1;

        return (
          <Group gap={4} wrap="nowrap">
            {totalImages > 0 ? (
              <Avatar.Group>
                <Tooltip label={`Primary Image of ${item.name}`}>
                  <Avatar src={primaryImage?.url} radius="sm" size="md" color="blue" />
                </Tooltip>

                {remainingCount > 0 && (
                  <Tooltip label={`${remainingCount} more image(s) available`}>
                    <Avatar radius="sm" size="md" variant="filled" color="gray">
                      <Text size="xs" fw={600}>
                        +{remainingCount}
                      </Text>
                    </Avatar>
                  </Tooltip>
                )}
              </Avatar.Group>
            ) : (
              <Avatar radius="sm" size="md" color="gray" variant="light">
                <IconCreditCard size={20} />
              </Avatar>
            )}
          </Group>
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
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify={{ sm: "space-between" }}
        gap={{ base: "md", sm: 0 }}
        mb="lg"
      >
        <Group gap="md">
          <Title order={3}>Cards</Title>
          {selectedIds.length > 0 && (
            <Button color="red" variant="light" size="xs" leftSection={<IconTrash size={14} />} onClick={handleBatchDelete} loading={deletingBatch}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </Group>

        <Flex gap="xs" wrap="wrap" justify={{ base: "flex-end", sm: "flex-start" }}>
          {isMobile ? (
            <>
              <Menu>
                <Menu.Target>
                  <Button variant="default" leftSection={<IconFileSpreadsheet size={16} />}>
                    Excel
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>
                    <Button variant="subtle" fullWidth leftSection={<IconFileSpreadsheet size={16} />} onClick={handleDownloadTemplate}>
                      Template
                    </Button>
                  </Menu.Item>
                  <Menu.Item>
                    <FileButton
                      key={importFile ? "active" : "reset"}
                      onChange={(file) => {
                        setImportFile(file);
                        handleImportExcel(file);
                      }}
                      accept=".xlsx"
                    >
                      {(props) => (
                        <Button {...props} variant="subtle" fullWidth leftSection={<IconUpload size={16} />}>
                          Import
                        </Button>
                      )}
                    </FileButton>
                  </Menu.Item>
                  <Menu.Item>
                    <Button variant="subtle" fullWidth leftSection={<IconDownload size={16} />} onClick={handleExportExcel}>
                      Export
                    </Button>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <ActionIcon variant="default" size="lg" onClick={fetchCards} loading={loading}>
                <IconRefresh size={18} />
              </ActionIcon>
              <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
                Add Card
              </Button>
            </>
          ) : (
            <>
              <Tooltip label="Download Excel Template">
                <Button variant="default" onClick={handleDownloadTemplate} leftSection={<IconFileSpreadsheet size={16} color="orange" />}>
                  Template
                </Button>
              </Tooltip>

              <FileButton
                key={importFile ? "active" : "reset"}
                onChange={(file) => {
                  setImportFile(file);
                  handleImportExcel(file);
                }}
                accept=".xlsx"
              >
                {(props) => (
                  <Button {...props} variant="default" loading={importing} leftSection={<IconUpload size={16} color="green" />}>
                    Import
                  </Button>
                )}
              </FileButton>

              <Button variant="default" onClick={handleExportExcel} loading={exporting} leftSection={<IconDownload size={16} color="blue" />}>
                Export
              </Button>

              <ActionIcon variant="default" size="lg" onClick={fetchCards} loading={loading}>
                <IconRefresh size={18} />
              </ActionIcon>

              <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
                Add Card
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <TableComponent
        data={cards}
        columns={columns}
        metadata={metadata}
        loading={loading || importing || deletingBatch}
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
