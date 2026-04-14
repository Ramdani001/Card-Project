"use client";

import { Box, Button, Center, Container, Divider, Image, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Article {
  title: string;
  content: string;
  images?: { url: string }[];
}

interface Props {
  articleId: string;
}

export const SinglePageArct = ({ articleId }: Props) => {
  const router = useRouter();
  const [data, setData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) throw new Error("Gagal mengambil data artikel");
        const result = await res.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (articleId) fetchArticle();
  }, [articleId]);

  const processContent = (html: string) => {
    if (!html) return "";
    // Mengganti containerstyle menjadi style untuk render yang benar
    return html.replace(/containerstyle="([^"]+)"/g, 'style="$1"');
  };

  if (loading) {
    return (
      <Container size="sm" py={80}>
        <Stack gap="md">
          <Skeleton height={40} width="80%" radius="xl" />
          <Skeleton height={400} radius="md" />
          <Skeleton height={20} mt={20} />
          <Skeleton height={20} />
          <Skeleton height={20} width="60%" />
        </Stack>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Center h={400}>
        <Stack align="center" gap="sm">
          <Text c="red" fw={600}>
            Error: {error || "Artikel tidak ditemukan"}
          </Text>
          <Button variant="light" onClick={() => router.back()}>
            Kembali
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box component="article" my={60}>
      <style>{`
        .article-content {
          line-height: 1.8;
          font-size: 1.1rem;
          color: var(--mantine-color-gray-8);
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .article-content h2, .article-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--mantine-color-dark-filled);
        }
        .article-content p {
          margin-bottom: 1.5rem;
        }
        .article-content a {
          color: var(--mantine-color-blue-6);
          text-decoration: none;
        }
        .article-content a:hover {
          text-decoration: underline;
        }
      `}</style>

      <Container size="md">
        <Title order={1} mb="xs" style={{ fontSize: "2.5rem", lineHeight: 1.2 }}>
          {data.title}
        </Title>

        <Divider my="xl" />

        {data.images?.[0]?.url && <Image src={data.images[0].url} alt={data.title} radius="md" mb={40} />}

        <Box className="article-content" dangerouslySetInnerHTML={{ __html: processContent(data.content) }} />
      </Container>
    </Box>
  );
};
