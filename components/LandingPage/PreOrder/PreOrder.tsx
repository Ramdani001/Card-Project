import { EventDto } from "@/types/dtos/EventDto";
import { Box, Button, Card, Center, Container, Grid, Image, Text, Loader, Indicator } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const PreOrder = () => {
  const [preOrder, setPreOrder] = useState<EventDto[]>([]);
  const [loadingPreOrder, setLoadingPreOrder] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPreOrder(json.data);
        } else {
          setPreOrder([]);
        }
      } catch (error) {
        console.error("Error fetch PreOrder:", error);
        notifications.show({ title: "Error", message: "Gagal mengambil data PreOrder.", color: "red" });
      } finally {
        setLoadingPreOrder(false);
      }
    };
    fetchPreOrder();
  }, []);

  const filteredPreOrder = selectedDate ? preOrder.filter((item) => dayjs(item.startDate).isSame(selectedDate, "day")) : preOrder;

  return (
    <Container mb={30} size="xl">
      <Box style={{ minHeight: 800 }} bg={"#f5f6fa"} p="md" mt="xl">
        <Center mb="xl">
          <h1 style={{ color: "#05004f", margin: 0 }}>Pre Order Event</h1>
        </Center>

        {loadingPreOrder ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Center>
                  <DatePicker
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val ? new Date(val) : null)}
                    size="md"
                    renderDay={(date) => {
                      const day = dayjs(date);
                      const dayNum = day.date();

                      const hasEvent = preOrder.some((event) => dayjs(event.startDate).isSame(date, "day"));

                      const isSelected = selectedDate && day.isSame(selectedDate, "day");

                      const isToday = day.isSame(new Date(), "day");

                      return (
                        <Indicator size={6} color="red" offset={-5} disabled={!hasEvent} withBorder processing>
                          <div
                            style={{
                              fontWeight: isToday || isSelected ? 1000 : 200,
                            }}
                          >
                            {dayNum}
                          </div>
                        </Indicator>
                      );
                    }}
                  />
                </Center>
                <Button variant="light" fullWidth mt="md" onClick={() => setSelectedDate(null)} disabled={!selectedDate}>
                  Tampilkan Semua Tanggal
                </Button>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
              {filteredPreOrder.length === 0 && (
                <Center h={100} bg="white" style={{ borderRadius: 8 }}>
                  <Text c="dimmed">Tidak ada event pada tanggal ini</Text>
                </Center>
              )}

              {filteredPreOrder.map((item) => {
                const startDate = new Date(item.startDate);
                const dayNum = startDate.getDate();
                const monthShort = startDate.toLocaleString("id-ID", { month: "short" });
                const dayName = startDate.toLocaleString("id-ID", { weekday: "long" });
                const hours = startDate.getHours().toString().padStart(2, "0");
                const minutes = startDate.getMinutes().toString().padStart(2, "0");

                return (
                  <Card key={item.id} shadow="sm" p="lg" radius="md" withBorder mb="md">
                    <Box style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <Box style={{ textAlign: "center", minWidth: 60 }}>
                        <Text size="xl" fw={800} style={{ lineHeight: 1, fontSize: "2rem" }} c="blue">
                          {dayNum}
                        </Text>
                        <Text size="sm" tt="uppercase" fw={700} c="dimmed">
                          {monthShort}
                        </Text>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="lg" fw={600} lineClamp={2}>
                          {item.title}
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          {dayName}, {hours}:{minutes} WIB
                        </Text>
                      </Box>
                      {item.images?.length > 0 && (
                        <Box style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                          <Image src={item.images[0].url} alt={item.title} w="100%" h="100%" fit="cover" />
                        </Box>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </Grid.Col>
          </Grid>
        )}
      </Box>
    </Container>
  );
};
