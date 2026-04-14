"use client";

import { EventDto } from "@/types/dtos/EventDto";
import { Box, Button, Card, Center, Container, Grid, Group, Image, Indicator, Loader, Modal, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

// Pastikan import CSS untuk dates (Wajib di v7)
import "@mantine/dates/styles.css";

export const PreOrder = () => {
  const [preOrder, setPreOrder] = useState<EventDto[]>([]);
  const [loadingPreOrder, setLoadingPreOrder] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPreOrder(json.data);
        }
      } catch {
        notifications.show({ title: "Error", message: "Gagal mengambil data PreOrder.", color: "red" });
      } finally {
        setLoadingPreOrder(false);
      }
    };
    fetchPreOrder();
  }, []);

  const filteredPreOrder = selectedDate ? preOrder.filter((item) => dayjs(item.startDate).isSame(selectedDate, "day")) : preOrder;

  const handleOpenModal = (event: EventDto) => {
    setSelectedEvent(event);
    open();
  };

  return (
    <Container mb={50} size="xl">
      <Modal opened={opened} onClose={close} title="Detail Event" centered size="lg">
        {selectedEvent && (
          <Stack>
            {selectedEvent.images?.[0] && <Image src={selectedEvent.images[0].url} radius="md" alt={selectedEvent.title} />}
            <Title order={3}>{selectedEvent.title}</Title>
            <Text size="sm" c="dimmed">
              {dayjs(selectedEvent.startDate).format("dddd, D MMMM YYYY - HH:mm")} WIB
            </Text>
            <Text>{selectedEvent.content || "There is no event description."}</Text>
          </Stack>
        )}
      </Modal>

      <Box bg="#f8f9fa" p={{ base: "md", md: "xl" }} style={{ borderRadius: 16 }}>
        <Title order={2} ta="center" mb="xl" c="blue.9">
          Pre Order Event
        </Title>

        {loadingPreOrder ? (
          <Center h={300}>
            <Loader color="blue" />
          </Center>
        ) : (
          <Grid>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card shadow="sm" radius="md" withBorder p="md">
                <Center>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    size="md"
                    allowDeselect
                    renderDay={(date) => {
                      const day = dayjs(date);
                      const hasEvent = preOrder.some((event) => dayjs(event.startDate).isSame(date, "day"));

                      return (
                        <Indicator size={6} color="red" offset={-2} disabled={!hasEvent} processing>
                          <div>{day.date()}</div>
                        </Indicator>
                      );
                    }}
                  />
                </Center>
                <Button variant="subtle" fullWidth mt="md" onClick={() => setSelectedDate(null)} disabled={!selectedDate}>
                  Clear Filter
                </Button>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
              <ScrollArea.Autosize mah={500} scrollbarSize={4}>
                <Stack gap="md">
                  {filteredPreOrder.length === 0 ? (
                    <Center h={150} bg="white" style={{ borderRadius: 12, border: "1px dashed #dee2e6" }}>
                      <Text c="dimmed">There are no events on this date</Text>
                    </Center>
                  ) : (
                    filteredPreOrder.map((item) => (
                      <Card
                        key={item.id}
                        shadow="xs"
                        p="md"
                        radius="md"
                        withBorder
                        onClick={() => handleOpenModal(item)}
                        style={{ cursor: "pointer", transition: "0.2s" }}
                      >
                        <Group align="center" wrap="nowrap">
                          <Box ta="center" miw={60}>
                            <Text size="xl" fw={800} c="blue.7" style={{ lineHeight: 1 }}>
                              {dayjs(item.startDate).date()}
                            </Text>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                              {dayjs(item.startDate).format("MMM")}
                            </Text>
                          </Box>

                          <Box style={{ flex: 1 }}>
                            <Text fw={600} lineClamp={1}>
                              {item.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {dayjs(item.startDate).format("dddd, HH:mm")} WIB
                            </Text>
                          </Box>

                          {item.images?.[0] && <Image src={item.images[0].url} w={60} h={60} radius="md" fit="cover" alt="" />}
                        </Group>
                      </Card>
                    ))
                  )}
                </Stack>
              </ScrollArea.Autosize>
            </Grid.Col>
          </Grid>
        )}
      </Box>
    </Container>
  );
};
