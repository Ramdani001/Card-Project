"use client";

import { ArticleDto } from "@/types/dtos/ArticleDto";
import { Box, Card, Container, Group, Image, ScrollArea, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const ArticleMain = () => {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/articles");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setArticles(json.data);
        }
      } catch {
        notifications.show({ title: "Error", message: "Gagal mengambil data artikel.", color: "red" });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const ArticleSkeleton = () => (
    <Card w={{ base: 280, md: 350 }} radius="md" p="md" withBorder>
      <Skeleton height={200} radius="md" mb="sm" />
      <Skeleton height={20} width="70%" mb="sm" />
      <Skeleton height={15} />
      <Skeleton height={15} />
    </Card>
  );

  return (
    <Box my={50}>
      <Container fluid mb={20}>
        <Stack gap={0} align="center">
          <Text c="blue.7" fw={700} size="sm" tt="uppercase" lts={1}>
            New Article
          </Text>
          <Title order={2}>Latest Articles</Title>
        </Stack>
      </Container>

      <Container fluid bg="#f5f6fa" my={40}>
        <ScrollArea scrollbars="x" type="never">
          <Group wrap="nowrap" gap="xl" justify="center">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <ArticleSkeleton key={i} />)
            ) : articles.length > 0 ? (
              articles.map((item) => (
                <Card
                  key={item.id}
                  w={{ base: 280, md: 350, lg: 400 }}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className="cardHover"
                  onClick={() => router.push(`/articless/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Section mb="sm">
                    <Image src={item.images?.[0]?.url || "/no-image.png"} alt={item.title} height={200} fit="cover" />
                  </Card.Section>

                  <Text fw={700} size="lg" lineClamp={1} mb={8}>
                    {item.title}
                  </Text>

                  <Text size="sm" c="dimmed" lineClamp={3} dangerouslySetInnerHTML={{ __html: item.content }} />
                </Card>
              ))
            ) : (
              <Text c="dimmed">No articles available.</Text>
            )}
          </Group>
        </ScrollArea>
      </Container>
    </Box>
  );
};
