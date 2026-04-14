import { CardDto } from "@/types/dtos/CardDto";
import { formatRupiah } from "@/utils";
import { Badge, Box, Card, Group, Image, Stack, Text } from "@mantine/core";

interface BoxCardProps {
  data: CardDto;
}

export const BoxCard: React.FC<BoxCardProps> = ({ data }) => {
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
    <Box pos="relative" h="100%">
      <Card
        shadow="md"
        padding="lg"
        radius="lg"
        withBorder
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          filter: isSoldOut ? "grayscale(100%)" : "none",
          opacity: isSoldOut ? 0.7 : 1,
          transition: "transform 0.2s ease",
          cursor: isSoldOut ? "not-allowed" : "pointer",
        }}
      >
        <Card.Section>
          <Image src={primaryImage} height={280} alt={data.name} fit="contain" p="md" bg="gray.0" />
        </Card.Section>

        <Stack justify="space-between" mt="md" style={{ flexGrow: 1 }}>
          <Box>
            <Text fw={700} size="lg" lineClamp={2} mb={4}>
              {data.name}
            </Text>
            <Badge color="blue" variant="light" size="sm">
              Case & Box
            </Badge>
          </Box>

          <Box>
            {data.discount ? (
              <Group gap="xs" align="flex-end">
                <Stack gap={0}>
                  <Text td="line-through" c="dimmed" size="xs">
                    Rp {priceNumber.toLocaleString("id-ID")}
                  </Text>
                  <Text fw={800} c="red.7" size="xl">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </Text>
                </Stack>
                <Badge color="red" variant="filled" mb={4}>
                  {data.discount.type === "PERCENTAGE" ? `${discountValue}% OFF` : "PROMO"}
                </Badge>
              </Group>
            ) : (
              <Text fw={800} size="xl">
                {formatRupiah(priceNumber)}
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
            backgroundColor: "rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "var(--mantine-radius-lg)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <Text
            c="white"
            fw={900}
            size="xl"
            style={{
              backgroundColor: "rgba(230, 0, 0, 0.9)",
              padding: "10px 25px",
              borderRadius: 4,
              transform: "rotate(-10deg)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              border: "2px solid white",
            }}
          >
            SOLD OUT
          </Text>
        </Box>
      )}
    </Box>
  );
};
