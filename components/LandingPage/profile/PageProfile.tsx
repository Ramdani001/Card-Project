"use client";

import { Box, Card, FileInput, Image, Paper, SimpleGrid, TextInput, Button, Text, Stack, Title, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const PageProfile = () => {
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const userId = session?.user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setFetching(true);
        const res = await fetch(`/api/profile/${userId}`);
        const json = await res.json();
        if (json.success) {
          setName(json.data.name || "");
          setEmail(json.data.email || "");
          setPreviewUrl(json.data.avatar || null);
        }
      } catch {
        notifications.show({ title: "Error", message: "Gagal mengambil data", color: "red" });
      } finally {
        setFetching(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setFetching(false);
    }
  }, [userId, status]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpdate = async () => {
    if (file && file.size > 2 * 1024 * 1024) {
      return notifications.show({
        title: "File Terlalu Besar",
        message: "Ukuran maksimal adalah 2MB",
        color: "orange",
      });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/profile/${userId}`, {
        method: "PATCH",
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        notifications.show({ title: "Berhasil", message: "Profil diperbarui!", color: "green" });
        setFile(null);
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      notifications.show({ title: "Gagal", message: error.message, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100%" pos="relative">
      <LoadingOverlay visible={fetching || status === "loading"} overlayProps={{ blur: 2 }} />

      <Paper p="xl" radius="md" withBorder>
        <Title order={3} mb="lg">
          Edit Profile
        </Title>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack gap="md">
            <TextInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} withAsterisk />

            <TextInput label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} withAsterisk />

            <FileInput
              label="Profile Picture"
              placeholder="Ganti foto profil"
              accept="image/png,image/jpeg"
              value={file}
              onChange={setFile}
              clearable
            />

            <Button color="blue" mt="md" onClick={handleUpdate} loading={loading} disabled={status !== "authenticated"}>
              Save Changes
            </Button>
          </Stack>

          <Stack align="center" justify="start">
            <Text size="sm" fw={500} w="100%">
              Preview
            </Text>
            <Card withBorder padding="xs" radius="md" w="100%" style={{ maxWidth: 400 }}>
              <Card.Section>
                <Image src={previewUrl || "https://placehold.co/600x400?text=No+Photo"} height={300} alt="Profile" fit="cover" />
              </Card.Section>
            </Card>
            <Text size="xs" c="dimmed">
              Format: JPG/PNG (Maks 2MB)
            </Text>
          </Stack>
        </SimpleGrid>
      </Paper>
    </Box>
  );
};
