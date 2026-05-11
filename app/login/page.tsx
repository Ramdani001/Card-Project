"use client";

import { Anchor, Box, Button, Center, Container, Group, Loader, Paper, PasswordInput, rem, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconAlertCircle, IconLock, IconMail } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="xl" type="dots" color="blue" />
      </Center>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("PLEASE_VERIFY_EMAIL")) {
          setError("Account not verified. Redirecting to verification...");
          setTimeout(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setError("Incorrect email or password!");
        }
      } else {
        router.push("/dashboard/main");
        router.refresh();
      }
    } catch {
      setError("An error occurred on the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="#f8f9fa" mih="100vh" style={{ display: "flex", alignItems: "center" }}>
      <Container size={420} my={40}>
        <Paper p="xl" radius="xs" withBorder shadow="sm" bg="white">
          <Stack gap="xs" mb="xl">
            <Title order={2} fw={800} style={{ color: "#212529", letterSpacing: rem(-0.5) }}>
              Account Login
            </Title>
            <Text c="dimmed" size="sm">
              Enter your credentials to manage your collections
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Paper withBorder p="sm" radius="xs" bg="red.0" style={{ borderColor: "var(--mantine-color-red-2)" }}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
                    <Text size="sm" c="red.7" fw={600}>
                      {error}
                    </Text>
                  </Box>
                </Paper>
              )}

              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                leftSection={<IconMail size={16} stroke={1.5} />}
                size="md"
                radius="xs"
                styles={{
                  label: { fontWeight: 700, fontSize: 13, marginBottom: 5, color: "#495057" },
                  input: { borderShadow: "none" },
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} stroke={1.5} />}
                size="md"
                radius="xs"
                styles={{
                  label: { fontWeight: 700, fontSize: 13, marginBottom: 5, color: "#495057" },
                }}
              />

              <Button
                type="submit"
                color="dark"
                fullWidth
                mt="lg"
                size="md"
                radius="xs"
                loading={loading}
                styles={{
                  root: {
                    fontWeight: 600,
                    transition: "transform 0.2s ease",
                    "&:active": { transform: "scale(0.98)" },
                  },
                }}
              >
                Sign In
              </Button>

              <Group justify="center" mt="md">
                <Text size="sm" c="dimmed">
                  Don`t have an account?{" "}
                  <Anchor component={Link} href="/register" size="sm" fw={700} c="dark">
                    Register here
                  </Anchor>
                </Text>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Text ta="center" mt="xl" size="xs" c="dimmed" style={{ textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          &copy; {new Date().getFullYear()} Toko Kartu
        </Text>
      </Container>
    </Box>
  );
}
