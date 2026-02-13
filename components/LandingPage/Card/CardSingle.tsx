import { Badge, Button, Card, Center, Group, Image, Text} from "@mantine/core";


export const CardSingle = () => {
  return (
    <>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Image
                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                height={160}
                alt="Norway"
                />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <Text size="md" c="dimmed">Norway Fjord Adventures</Text>
                <Badge color="pink">On Sale</Badge>
            </Group>

            <Text fw={500}>
                Rp. 1.550.000,00
            </Text>

            <Button color="blue" fullWidth mt="md" radius="md">
                Add To Card
            </Button>
        </Card>
    </>
  );
};