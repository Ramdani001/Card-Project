"use client";

import { Anchor, Box, Button, Container, Divider, Grid, Group, Stack, Text, TextInput, Title } from "@mantine/core";

export const FooterSection = () => {
  return (
    <Box component="footer" bg="#1a1b1e" c="gray.5" py={60} style={{ borderTop: "4px solid var(--mantine-color-blue-filled)" }}>
      <Container size="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={4} c="white" mb="md" style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2 }}>
              TOKO KARTU
            </Title>
            <Text size="sm" maw={300} style={{ lineHeight: 1.6 }}>
              The ultimate destination for trading card games. We sell singles, sealed products, and accessories for all your favorite games.
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Title order={6} c="white" mb="md" tt="uppercase" lts={1}>
              Shop
            </Title>
            <Stack gap="xs">
              {["New Arrivals", "Pre-Orders", "On Sale", "Best Sellers"].map((link) => (
                <Anchor key={link} href="#" size="sm" c="dimmed" underline="hover" style={{ transition: "color 0.2s ease" }}>
                  {link}
                </Anchor>
              ))}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }} offset={{ md: 2 }}>
            <Title order={6} c="white" mb="md" tt="uppercase" lts={1}>
              Stay Connected
            </Title>
            <Text size="sm" mb="sm">
              Subscribe to get special offers and game updates.
            </Text>
            <Group gap="xs" align="flex-start">
              <TextInput
                placeholder="Email Address"
                radius="md"
                style={{ flex: 1 }}
                styles={{ input: { backgroundColor: "#25262b", border: "none", color: "white" } }}
              />
              <Button radius="md" color="blue" variant="filled">
                JOIN
              </Button>
            </Group>
          </Grid.Col>
        </Grid>

        <Divider my={40} color="gray.8" />

        <Group justify="space-between" wrap="wrap">
          <Text size="xs" c="dimmed">
            © 2026 TOKO KARTU. All Rights Reserved.
          </Text>
          <Group gap="xl">
            <Anchor href="#" size="xs" c="dimmed" underline="hover">
              Privacy Policy
            </Anchor>
            <Anchor href="#" size="xs" c="dimmed" underline="hover">
              Terms of Service
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
