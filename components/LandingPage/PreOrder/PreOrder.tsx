import { Badge, Box, Button, Card, Center, Container, Grid, Group, Image, SimpleGrid, Text} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";


export const PreOrder = () => {

 const [PreOrder, setPreOrder] = useState<Event[]>([]);
          const [loadingPreOrder, setLoadingPreOrder] = useState(true);
          const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    
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
            console.log(fetchPreOrder());
          }, []);

      const filteredPreOrder = selectedDate
      ? PreOrder.filter((item) => {
          const itemDate = new Date(item.startDate);

          return (
            itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() === selectedDate.getMonth() &&
            itemDate.getDate() === selectedDate.getDate()
          );
        })
      : PreOrder;

      const handleDateChange = (value: Date | null) => {
        setSelectedDate(value);
        console.log(value);
      };

  return (
    <>
      <Container mb={30}>
        <Box 
        w={"63vw"}
        h={800}
        bg={"#f5f6fa"}
        >
          <Center>
            <h1 style={{color: "#05004f"}}>Pre Order</h1>
        </Center>

        <Box>
          <Grid>
            <Grid.Col span={5}>
              <Center>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Calendar
                    bg="#fff"
                    value={selectedDate}          // ✅ HARUS state
                    onChange={handleDateChange}
                  />
                  <Button
                  variant="light"
                  fullWidth
                  mt="md"
                  onClick={() => setSelectedDate(null)}
                >
                  Clear Date
                </Button>
                </Card>
              </Center>
            </Grid.Col>
            <Grid.Col span={7}>
               {filteredPreOrder.length === 0 && (
                <Text c="dimmed">
                  Tidak ada event pada tanggal ini
                </Text>
                )}

                 {filteredPreOrder.map((item) => {
                const startDate = new Date(item.startDate);

                const dayNum = startDate.getDate();
                const monthShort = startDate.toLocaleString("en-US", {
                  month: "short",
                });

                const dayName = startDate.toLocaleString("en-US", {
                  weekday: "short",
                });

                const hours = startDate
                  .getHours()
                  .toString()
                  .padStart(2, "0");

                const minutes = startDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0");

                const description = `${dayName}, ${dayNum} ${monthShort}, ${hours}:${minutes}`;

                return (
                  <Card key={item.id} shadow="sm" p="lg" radius="md" withBorder mb="md">
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box style={{ textAlign: "center", marginRight: 16 }}>
                        <Text size="lg" fw={700}>
                          {dayNum}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {monthShort}
                        </Text>
                      </Box>

                      <Box style={{ flex: 1, paddingRight: 16 }}>
                        <Text size="sm" fw={500}>
                          {item.title}
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          {description}
                        </Text>
                      </Box>

                      {item.images?.length > 0 && (
                        <Box
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={item.images[0].url}
                            alt={item.title}
                            w="100%"
                            h="100%"
                            fit="cover"
                          />
                        </Box>
                      )}
                    </Box>
                  </Card>
                );
              })}
              </Grid.Col>
          </Grid>
        </Box>

        </Box>
      </Container>
    </>
  );
};
