"use client";

import { Container, Image } from "@mantine/core";
import { log } from "console";
import { useEffect, useState } from "react";

interface Props {
  articleId: string;
}

export const SinglePageArct = ({ articleId }: Props) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`../api/articles/${articleId}` );
        
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        setData(result.data);
      } catch (error) {
        console.error(error);
      }

    };

    fetchArticle();
  }, [articleId]);
  if (!data) return <p>Loading...</p>;
  return (
    <>
    <Container>
        {Array.isArray(data) ? (
            data.map((item, index) => (
            <div key={item.id ?? index}>
                <h1>{item.title} s</h1>
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
            ))
        ) : (
            <>
            <h1>{data.title}</h1>
            <Image
                src={`${data.images?.[0]?.url}`}
                alt={data.title}
            />
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </>
        )}
        </Container>
    </>
  );
};