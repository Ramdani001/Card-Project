"use client";

import { Anchor, Button, Center, Container, FileInput, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      notifications.show({
        title: "Validasi Gagal",
        message: "Password dan Konfirmasi Password tidak cocok",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      notifications.show({
        title: "Validasi Gagal",
        message: "Password minimal 6 karakter",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("name", form.name);

      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Gagal melakukan registrasi");
      }

      notifications.show({
        title: "Registrasi Berhasil",
        message: "Akun Anda berhasil dibuat. Silakan login.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      notifications.show({
        title: "Registrasi Gagal",
        message: err.message || "Terjadi kesalahan pada server.",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
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
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Nama Lengkap"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.currentTarget.value)}
                radius="md"
              />

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

              <FileInput
                label="Foto Profil (Opsional)"
                placeholder="Pilih gambar"
                leftSection={<IconPhoto size={16} />}
                accept="image/png,image/jpeg,image/webp"
                value={file}
                onChange={setFile}
                clearable
                radius="md"
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
