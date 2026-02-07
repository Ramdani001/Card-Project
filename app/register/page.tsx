"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert, Stack, Center, Anchor } from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama!");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal melakukan registrasi");
      }

      setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: "100vh" }}>
      <Container size={420} my={40}>
        <Title ta="center" fw={900} order={2}>
          Register Dev-Card
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Buat akun baru untuk memulai perjalanan Anda.
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Gagal" color="red" mb="md" radius="md">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size="1rem" />} title="Berhasil" color="teal" mb="md" radius="md">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="user@mail.com"
                required
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.currentTarget.value)}
                radius="md"
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.currentTarget.value)}
                radius="md"
              />

              <PasswordInput
                label="Konfirmasi Password"
                placeholder="••••••••"
                required
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.currentTarget.value)}
                radius="md"
                error={form.confirmPassword && form.password !== form.confirmPassword ? "Password tidak cocok" : null}
              />

              <Button type="submit" fullWidth mt="xl" radius="md" size="md" loading={loading}>
                Daftar Sekarang
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="md" size="sm">
            Sudah punya akun?{" "}
            <Anchor component={Link} href="/login" fw={700}>
              Login
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Center>
  );
}
