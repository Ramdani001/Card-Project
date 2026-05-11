"use client";

import { ActionIcon, Anchor, Box, Container, Grid, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <Box component="footer" bg="#121212" c="gray.5" py={60}>
      <Container size="xl">
        <Box mb={40}>
          <Image src="/toko-kartu-logo.png" alt="Toko Kartu Logo" w={140} bg="white" p={8} radius="sm" />
        </Box>

        <Grid justify="space-between">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              <Box>
                <Title order={5} c="gray.6" mb="lg" tt="uppercase" lts={1} fw={700}>
                  TOKO KARTU
                </Title>
                <Text size="md" maw={500} c="gray.1" style={{ lineHeight: 1.7 }}>
                  Your journey in the world of TCG starts here. At Toko Kartu, we are dedicated to providing the best collection and service for every
                  duelist and collector. Thank you for letting us be part of your winning deck!
                </Text>
              </Box>

              <Group gap="md">
                {[
                  { icon: IconBrandFacebook, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                  { icon: IconBrandInstagram, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                  { icon: IconBrandTwitter, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                  { icon: IconBrandTiktok, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                  { icon: IconBrandYoutube, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                ].map((social, index) => (
                  <ActionIcon
                    key={index}
                    size={45}
                    radius="xl"
                    variant="outline"
                    color="gray.1"
                    component="a"
                    target="_blank"
                    href={social.link}
                    style={{ border: "1px solid #444" }}
                  >
                    <social.icon size={20} stroke={1.5} />
                  </ActionIcon>
                ))}
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Title order={5} c="gray.6" mb="lg" tt="uppercase" lts={1} fw={700}>
              FOOTER MENU
            </Title>
            <Stack gap="sm">
              {[
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Term of Service", href: "/terms" },
                { label: "Contact US", href: "/contact" },
              ].map((link) => (
                <Anchor
                  component={Link}
                  key={link.label}
                  href={link.href}
                  c="gray.1"
                  size="md"
                  underline="never"
                  style={{ transition: "opacity 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>

        <Box mt={60} style={{ borderTop: "1px solid #333", paddingTop: "20px" }}>
          <Text size="xs" c="dimmed">
            © 2026 TOKO KARTU. All Rights Reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};
