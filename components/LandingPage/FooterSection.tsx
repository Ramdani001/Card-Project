import { Anchor, Box, Button, Container, Divider, Grid, Group, Stack, Text, TextInput, Title } from "@mantine/core";


export const FooterSection = () => {
  return (
    <Box bg="#212529" c="gray.5" py={50} mt={50} style={{ borderTop: "4px solid #0056b3" }}>
      <Container size="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={4} c="white" mb="md" ff="Impact" style={{ letterSpacing: 1 }}>
              DEVCARD
            </Title>
            <Text size="sm" maw={300}>
              The ultimate destination for trading card games. We sell singles, sealed products, and accessories for all your favorite games.
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Title order={6} c="white" mb="md" tt="uppercase">
              Shop
            </Title>
            <Stack gap="xs">
              <Anchor href="#" size="sm" c="dimmed">
                New Arrivals
              </Anchor>
              <Anchor href="#" size="sm" c="dimmed">
                Pre-Orders
              </Anchor>
              <Anchor href="#" size="sm" c="dimmed">
                On Sale
              </Anchor>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={6} c="white" mb="md" tt="uppercase">
              Stay Connected
            </Title>
            <Group gap="xs">
              <TextInput placeholder="Email Address" radius="xs" style={{ flex: 1 }} />
              <Button radius="xs" color="blue">
                JOIN
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
        <Divider my="xl" color="dark.4" />
        <Group justify="space-between">
          <Text size="xs">© 2026 DevCard. All Rights Reserved.</Text>
          <Text size="xs">Privacy Policy | Terms of Service</Text>
        </Group>
      </Container>
    </Box>
  );
};
