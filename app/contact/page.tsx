"use client";

import { useState } from "react"; // Tambahkan ini
import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useCart } from "@/components/hooks/useCart";
import { ActionIcon, Box, Button, Container, Grid, Group, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";

export default function ContactPage() {
  const { cartItems, setCartItems, loadingCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\n` + `Email: ${email}\n\n` + `Message:\n${message}`);

    window.location.href = `mailto:admin@toko-kartu.com?subject=${subject}&body=${body}`;
  };

  return (
    <Box mih="100vh" bg="white">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="xl" py={40}>
        <Title order={1} fw={900} size="36px" mb="sm">
          Contact US
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap={40}>
              <Box>
                <Text size="sm" c="dimmed" mb={5}>
                  Contact / Whatsapp number
                </Text>
                <Text fw={600} size="lg">
                  -
                </Text>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" mb={5}>
                  Email Address
                </Text>
                <Text fw={600} size="lg">
                  admin@toko-kartu.com
                </Text>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" mb="md">
                  Follow Us :
                </Text>
                <Group gap="xs">
                  {[
                    { icon: IconBrandFacebook, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                    { icon: IconBrandInstagram, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                    { icon: IconBrandTwitter, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                    { icon: IconBrandTiktok, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                    { icon: IconBrandYoutube, link: "https://www.facebook.com/profile.php?id=61589769803425" },
                  ].map((social, index) => (
                    <ActionIcon
                      key={index}
                      size={40}
                      radius="xl"
                      variant="outline"
                      color="gray.4"
                      c="black"
                      component="a"
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon size={18} />
                    </ActionIcon>
                  ))}
                </Group>
              </Box>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Title order={3} mb="xl" style={{ fontFamily: "sans-serif" }}>
              Inquires Form
            </Title>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput placeholder="Your name..." value={name} onChange={(e) => setName(e.currentTarget.value)} required />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput placeholder="Your email..." value={email} onChange={(e) => setEmail(e.currentTarget.value)} required type="email" />
                  </Grid.Col>
                </Grid>

                <Textarea
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  required
                  autosize
                  minRows={3}
                  maxRows={6}
                  styles={{
                    input: {
                      resize: "vertical",
                    },
                  }}
                />

                <Button type="submit" bg="black" size="lg" radius="0" w={{ base: "100%", sm: 200 }} mt="md">
                  SEND
                </Button>
              </Stack>
            </form>
          </Grid.Col>
        </Grid>
      </Container>

      <Box mt={100}>
        <FooterSection />
      </Box>
    </Box>
  );
}
