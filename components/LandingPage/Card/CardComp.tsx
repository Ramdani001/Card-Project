import { Card, Image, Text, Box } from "@mantine/core";

export const CardComp = () => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <Card.Section>
        <Image
          src="https://tcg-corner.com/cdn/shop/files/Pokemon_700x875_crop_center.gif?v=1733996578"
          height={320}
          alt="Yugioh Collection"
          fit="cover"
        />
      </Card.Section>

      <Box pt="md">
        <Text fw={700} size="lg" ta="center">
          Yugioh
        </Text>
      </Box>
    </Card>
  );
};
