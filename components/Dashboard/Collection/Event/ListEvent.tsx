"use client";

import { ColumnDef, TableComponent } from "@/components/layout/TableComponent";
import { EventDto } from "@/types/dtos/EventDto";
import { PaginationMetaDataDto } from "@/types/dtos/PaginationMetaDataDto";
import { ActionIcon, Avatar, Badge, Box, Button, Flex, Group, Paper, Text, ThemeIcon, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowRight, IconCalendarEvent, IconCheck, IconPencil, IconPhoto, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { EventForm } from "./EventForm";

const ListEvent = () => {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaDataDto>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "startDate",
    sortOrder: "desc" as "asc" | "desc",
    filters: {} as Record<string, string>,
  });

  const fetchEvents = async () => {
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

      const res = await fetch(`/api/events?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setEvents(json.data);
        setMetadata(json.metadata);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      notifications.show({ title: "Error", message: "Failed to fetch events", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
      title: "Delete Event",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this event?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
          const json = await res.json();

          if (json.success) {
            notifications.show({
              title: "Success",
              message: "Event deleted successfully",
              color: "teal",
              icon: <IconCheck size={16} />,
            });
            fetchEvents();
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
    setSelectedEvent(null);
    open();
  };

  const handleOpenEdit = (event: EventDto) => {
    setSelectedEvent(event);
    open();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: ColumnDef<EventDto>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "title",
      label: "Event Info",
      sortable: true,
      render: (item) => (
        <Group gap="sm">
          <Avatar src={item.images[0]?.url || null} radius="sm" size="md" color="blue">
            <IconCalendarEvent size={20} />
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
      key: "startDate",
      label: "Schedule",
      sortable: true,
      render: (item) => (
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={500}>
            {formatDate(item.startDate)}
          </Text>

          <ThemeIcon variant="transparent" c="dimmed" size="xs">
            <IconArrowRight size={14} />
          </ThemeIcon>

          <Text size="sm" c="dimmed">
            {formatDate(item.endDate)}
          </Text>
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
        <Title order={3}>List Event</Title>

        <Group>
          <ActionIcon variant="default" size="lg" onClick={fetchEvents} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenAdd}>
            Add Event
          </Button>
        </Group>
      </Flex>

      <TableComponent
        data={events}
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

      <EventForm
        opened={opened}
        onClose={close}
        eventToEdit={selectedEvent}
        onSuccess={() => {
          fetchEvents();
        }}
      />
    </Paper>
  );
};

export default ListEvent;
