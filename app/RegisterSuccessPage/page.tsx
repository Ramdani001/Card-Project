"use client";

import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useCart } from "@/components/hooks/useCart";
import { Box, Container, Title, Text, Stack, Paper, ThemeIcon, Button, Group } from "@mantine/core";
import { IconCircleCheck, IconLogin2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterSuccessPage() {
  const { cartItems, setCartItems, loadingCart } = useCart();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <Box bg="#f8fafc" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="sm" py={100}>
        <Stack gap={28} align="center">
          <ThemeIcon color="teal" size={90} radius="50%">
            <IconCircleCheck size={54} stroke={1.5} />
          </ThemeIcon>

          <Box ta="center">
            <Title order={1} fw={900} size="32px" mb="xs">
              Registrasi Berhasil!
            </Title>
            <Text c="dimmed" size="lg" maw={420} mx="auto">
              Akun kamu sudah berhasil dibuat. Kamu akan diarahkan ke halaman login dalam {countdown} detik.
            </Text>
          </Box>

          <Paper p="lg" radius="md" withBorder w="100%" ta="center">
            <Group justify="center">
              <Button
                onClick={() => router.push("/login")}
                size="md"
                radius="md"
                leftSection={<IconLogin2 size={18} />}
                color="blue"
              >
                Masuk Sekarang
              </Button>
            </Group>
          </Paper>
        </Stack>
      </Container>

      <FooterSection />
    </Box>
  );
}