import { CardDto } from "@/types/dtos/CardDto";
import { Badge, Box, Card, Group, Image, Stack, Text } from "@mantine/core";

interface CardSingleProps {
  data: CardDto;
}

export const CardSingle: React.FC<CardSingleProps> = ({ data }) => {
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
    <Box pos="relative" style={{ height: "100%" }}>
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease",
          cursor: isSoldOut ? "not-allowed" : "pointer",
          ":hover": !isSoldOut
            ? {
                transform: "translateY(-5px)",
                boxShadow: "var(--mantine-shadow-md)",
              }
            : undefined,
          filter: isSoldOut ? "grayscale(80%)" : "none",
          opacity: isSoldOut ? 0.8 : 1,
        }}
      >
        <Card.Section>
          <Image src={primaryImage} alt={data.name} height={220} fit="contain" bg="gray.1" />
        </Card.Section>

        <Stack gap="xs" mt="md" style={{ flexGrow: 1 }}>
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Text fw={500} size="sm" lineClamp={2} style={{ lineHeight: 1.4 }}>
              {data.name}
            </Text>
            {data.discount && (
              <Badge color="red" variant="filled" size="sm" circle>
                {data.discount.type === "PERCENTAGE" ? `-${discountValue}%` : "!"}
              </Badge>
            )}
          </Group>

          <Box mt="auto">
            {data.discount ? (
              <>
                <Text td="line-through" c="dimmed" size="xs">
                  Rp {priceNumber.toLocaleString("id-ID")}
                </Text>
                <Text fw={700} c="blue.8" size="md">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </Text>
              </>
            ) : (
              <Text fw={700} size="md">
                Rp {priceNumber.toLocaleString("id-ID")}
              </Text>
            )}
          </Box>
        </Stack>
      </Card>

      {isSoldOut && (
        <Box
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "var(--mantine-radius-md)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <Badge color="dark" size="xl" variant="filled" style={{ transform: "rotate(-15deg)", border: "2px solid white" }}>
            SOLD OUT
          </Badge>
        </Box>
      )}
    </Box>
  );
};
