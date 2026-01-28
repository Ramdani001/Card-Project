"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert, Stack, Center } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError("Email atau password salah!");
      } else {
        router.push("/dashboard/main");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: "100vh" }}>
      <Container size={420} my={40}>
        <Title ta="center" fw={900} order={2}>
          Login Dev-Card
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Selamat datang kembali! Silakan masuk ke akun Anda.
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Gagal Login" color="red" mb="md" radius="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="admin@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                radius="md"
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                radius="md"
              />

              <Button type="submit" fullWidth mt="xl" radius="md" size="md" loading={loading} loaderProps={{ type: "dots" }}>
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Center>
  );
}
