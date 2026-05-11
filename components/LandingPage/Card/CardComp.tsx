import { AspectRatio, Box, Card, Image, Overlay, Stack, Text } from "@mantine/core";
import { useState } from "react";

interface CardCompProps {
  name: string;
  image: string;
}

export const CardComp = ({ name, image }: CardCompProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      padding="0"
      radius="16px"
      withBorder
      style={{
        height: "100%",
        overflow: "hidden",
        transition: "all 0.4s ease",
        background: "#fff",
        borderColor: hovered ? "#000" : "#e0e0e0",
        borderWidth: "1.5px",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-8px)" : "none",
        cursor: "pointer",
      }}
    >
      <Card.Section style={{ position: "relative", overflow: "hidden" }}>
        <AspectRatio ratio={3 / 4}>
          <Image
            src={image}
            alt={name}
            fit="cover"
            style={{
              transition: "transform 0.8s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            fallbackSrc="https://placehold.co/600x800?text=No+Image"
          />
        </AspectRatio>

        <Overlay gradient="linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)" zIndex={1} />
      </Card.Section>

      <Box p="lg">
        <Stack gap={4}>
          <Text
            fw={800}
            size="md"
            ta="left"
            lineClamp={2}
            c="black"
            style={{
              lineHeight: 1.2,
              transition: "color 0.3s ease",
            }}
          >
            {name}
          </Text>
        </Stack>

        <Box
          mt={12}
          style={{
            height: "2px",
            width: hovered ? "40px" : "20px",
            background: "black",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Card>
  );
};
