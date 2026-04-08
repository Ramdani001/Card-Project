import { ArticleDto } from "@/types/dtos/ArticleDto";
import { Box, Card, Center, Container, Group, Image, Skeleton, Text, Typography } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const ArticleMain = () => {
  const [article, setEvents] = useState<ArticleDto[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const route = useRouter();

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const res = await fetch("/api/articles");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetch article:", error);
        notifications.show({ title: "Error", message: "Gagal mengambil data article.", color: "red" });
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchPreOrder();
  }, []);

  if (loadingEvents) {
    return (
      <Group wrap="nowrap" gap="lg">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} w={{ base: 250, md: 350 }} radius="md" p="md">
              <Skeleton height={200} radius="md" mb="sm" />
              <Skeleton height={20} width="70%" mb="sm" />
              <Skeleton height={15} />
            </Card>
          ))}
      </Group>
    );
  }

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
          {article.map((item) => (
            <Card
              key={item.id}
              w={{ base: 150, md: 300, lg: 450 }}
              h={{ base: 200, md: 300, lg: 500 }}
              className="cardHover"
              onClick={() => {
                route.push(`/articless/${item.id}`);
              }}
            >
              <Box style={{ width: "100%", height: "70%", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <Image src={item.images[0].url} alt={item.title} w="100%" h="100%" fit="cover" />
              </Box>
              <Text fw="bold">{item.title}</Text>
              <Typography>
                <Text lineClamp={2} dangerouslySetInnerHTML={{ __html: item.content }} />
              </Typography>
            </Card>
          ))}
        </Group>
      </Box>
    </>
  );
};
