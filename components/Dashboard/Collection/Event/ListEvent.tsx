"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Badge, Button, Flex, Group, Paper, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendarEvent, IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { TableComponent, ColumnDef } from "@/components/layout/TableComponent";
import { PaginationMetaData } from "@/types/PaginationMetaData";
import { Event } from "@/types/Event";
import { EventForm } from "./EventForm";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";

const ListEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const handleDelete = (id: number) => {
    openConfirmModal({
      title: "Delete Event",
      centered: true,
      children: <Text size="sm">Are you sure you want to delete this event? This action cannot be undone.</Text>,
      labels: { confirm: "Delete Event", cancel: "Cancel" },
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
    setSelectedEvent(null);
    open();
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    open();
  };

  // Definisi Kolom
  const columns: ColumnDef<Event>[] = [
    {
      key: "no",
      label: "No",
      sortable: false,
      width: 60,
      render: (_, index) => (metadata.page - 1) * metadata.limit + index + 1,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Text fw={500} size="sm">
          {item.title}
        </Text>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (item) => (
        <Text size="sm">
          {new Date(item.startDate).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      sortable: true,
      render: (item) => (
        <Text size="sm">
          {new Date(item.endDate).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ),
    },
    {
      key: "images",
      label: "Images",
      sortable: false,
      render: (item) => {
        const count = item.images?.length || 0;
        return count > 0 ? (
          <Badge color="grape" variant="light">
            {count} Images
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            No Images
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
          <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(item)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.idEvent)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Title order={3}>List Event</Title>
        <Button leftSection={<IconCalendarEvent size={18} />} onClick={handleOpenAdd}>
          Add Event
        </Button>
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
