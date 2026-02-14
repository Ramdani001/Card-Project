import { CardData } from "@/types/CardData";
import { Badge, Button, Card, Group, Image, Text, Box } from "@mantine/core";
interface CardSingleProps {
  data: CardData;
}

export const BoxCard: React.FC<CardSingleProps> = ({ data }) => {
  const priceNumber = Number(data.price);

  const discountValue = data.discount ? Number(data.discount.value) : 0;

  const finalPrice =
    data.discount?.type === "PERCENTAGE"
      ? priceNumber - (priceNumber * discountValue) / 100
      : data.discount?.type === "NOMINAL"
        ? priceNumber - discountValue
        : priceNumber;

  const primaryImage = data.images.find((img) => img.isPrimary)?.url || data.images[0]?.url || "/no-image.png";

  const isSoldOut = data.stock === 0;

  return (
    <Box pos="relative">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          filter: isSoldOut ? "grayscale(100%)" : "none",
          opacity: isSoldOut ? 0.7 : 1,
        }}
      >
        <Card.Section>
          <Image src={primaryImage} height={360} alt={data.name} />
        </Card.Section>
      </Card>

      {/* Overlay SOLD OUT */}
      {isSoldOut && (
        <Box
          pos="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          <Text
            c="white"
            fw={700}
            size="lg"
            style={{
              backgroundColor: "red",
              padding: "6px 16px",
              borderRadius: 6,
            }}
          >
            SOLD OUT
          </Text>
        </Box>
      )}
    </Box>
  );
};
