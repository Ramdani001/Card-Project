import { Badge, Button, Card, Group, Image, Text, Box } from "@mantine/core";
import { Product } from "./types";

interface CardSingleProps {
  data: Product;
}

export const CardSingle: React.FC<CardSingleProps> = ({ data }) => {
  const priceNumber = Number(data.price);

  const discountValue = data.discount
    ? Number(data.discount.value)
    : 0;

  const finalPrice =
    data.discount?.type === "PERCENTAGE"
      ? priceNumber - (priceNumber * discountValue) / 100
      : data.discount?.type === "FIXED"
      ? priceNumber - discountValue
      : priceNumber;

  const primaryImage =
    data.images.find((img) => img.isPrimary)?.url ||
    data.images[0]?.url ||
    "/no-image.png";

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
          <Image
            src={primaryImage}
            height={160}
            alt={data.name}
          />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text size="md" c="dimmed" lineClamp={1}>
            {data.name}
          </Text>

          {data.discount && (
            <Badge color="pink">
              {data.discount.type === "PERCENTAGE"
                ? `${discountValue}%`
                : "Discount"}
            </Badge>
          )}
        </Group>

        {data.discount ? (
          <>
            <Text td="line-through" c="dimmed" size="sm">
              Rp {priceNumber.toLocaleString("id-ID")}
            </Text>
            <Text fw={600} c="red">
              Rp {finalPrice.toLocaleString("id-ID")}
            </Text>
          </>
        ) : (
          <Text fw={600}>
            Rp {priceNumber.toLocaleString("id-ID")}
          </Text>
        )}

        <Button
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          disabled={isSoldOut}
        >
          {isSoldOut ? "Out of Stock" : "Add To Cart"}
        </Button>
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
