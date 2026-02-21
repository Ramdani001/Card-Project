import { EventDto } from "@/types/dtos/EventDto";
import { Box, Card, Center, Container, Group, Image, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";

export const ArticleMain = () => {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetch events:", error);
        notifications.show({ title: "Error", message: "Gagal mengambil data events.", color: "red" });
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchPreOrder();
  }, []);

  return (
    <>
      <Container>
        <Center mb={3}>
          <Box style={{ textAlign: "center" }}>
            <Text>New Article</Text>
            <Text fw={600}>Latest articles</Text>
          </Box>
        </Center>
      </Container>
      <Box w={"99vw"} bg={"#f5f6fa"} p={20} m={4}>
        <Group wrap="nowrap" gap="xl">
          {events.map((item) => (
            <Card key={item.id} w={{ base: 150, md: 300, lg: 450 }} h={{ base: 200, md: 300, lg: 500 }} className="cardHover">
              {/* Contoh isi card */}
              <Box style={{ width: "100%", height: "70%", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <Image src={item.images[0].url} alt={item.title} w="100%" h="100%" fit="cover" />
              </Box>
              <Text fw="bold">{item.title}</Text>
              <Text size="sm">{item.content}</Text>
            </Card>
          ))}
        </Group>
      </Box>
    </>
  );
};
