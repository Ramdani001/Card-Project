"use client";

import { Center, Container, Image, Skeleton, Stack, Text, Title } from "@mantine/core";
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
    return html.replace(/containerstyle="([^"]+)"/g, 'style="$1"');
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack>
          <Skeleton height={50} width="70%" radius="xl" />
          <Skeleton height={300} radius="md" />
          <Skeleton height={20} mt={10} />
          <Skeleton height={20} />
          <Skeleton height={20} width="50%" />
        </Stack>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Center h={200}>
        <Text color="red">Error: {error || "Artikel tidak ditemukan"}</Text>
      </Center>
    );
  }

  return (
    <>
      <style>{`
        .article-content img {
          max-width: 100%;
          height: auto;
        }
        .article-content .node-imageResize,
        .article-content [containerstyle] {
          display: inline-block;
        }
        .article-content p {
          display: block;
          margin-bottom: 1rem;
        }
      `}</style>

      <Container size="md" py="xl">
        <Title order={1} mb="lg">
          {data.title}
        </Title>

        {data.images?.[0]?.url && <Image src={data.images[0].url} alt={data.title} radius="md" mb="xl" />}

        <div className="article-content" dangerouslySetInnerHTML={{ __html: processContent(data.content) }} />
      </Container>
    </>
  );
};
