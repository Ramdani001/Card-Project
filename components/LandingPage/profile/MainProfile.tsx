"use client";

import { useCart } from "@/components/hooks/useCart";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  FileInput,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconCamera,
  IconCheck,
  IconDeviceFloppy,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FooterSection } from "../FooterSection";
import { HeaderSection } from "../HeaderSection";

export const MainProfile = () => {
  const { cartItems, setCartItems, loadingCart } = useCart();
  const { data: session, status, update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
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
          setFacebookUrl(json.data.facebookUrl || "");
          setInstagramUrl(json.data.instagramUrl || "");
          setTwitterUrl(json.data.twitterUrl || "");
        }
      } catch {
        notifications.show({ title: "Error", message: "Gagal memuat profil", color: "red" });
      } finally {
        setFetching(false);
      }
    };

    if (status === "authenticated") fetchProfile();
    else if (status === "unauthenticated") setFetching(false);
  }, [userId, status]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpdate = async () => {
    if (file && file.size > 2 * 1024 * 1024) {
      return notifications.show({ title: "File Terlalu Besar", message: "Maksimal ukuran file 2MB", color: "orange" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("facebookUrl", facebookUrl);
      formData.append("instagramUrl", instagramUrl);
      formData.append("twitterUrl", twitterUrl);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/profile/${userId}`, { method: "PATCH", body: formData });
      const json = await res.json();

      if (json.success) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: name,
            image: previewUrl,
          },
        });

        notifications.show({
          title: "Success",
          message: "Your profile has been updated",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        setFile(null);
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      notifications.show({ title: "Gagal", message: error.message || "Internal server error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    input: {
      borderRadius: "8px",
      "&:focus": { borderColor: "var(--mantine-color-indigo-filled)" },
    },
    label: { marginBottom: "5px", fontWeight: 600 },
  };

  return (
    <Box bg="#f8fafc" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="md" py={40}>
        <Stack gap="xl">
          <Box>
            <Title order={2} fw={800} c="slate.9">
              Profile
            </Title>
            <Text c="dimmed" size="sm">
              Manage your account information and social media presence.
            </Text>
          </Box>

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p="md" radius="xs" withBorder shadow="sm">
                <Stack align="center" gap="lg">
                  <Box pos="relative">
                    <Skeleton visible={fetching} circle>
                      <Avatar src={previewUrl} size={120} radius="100%" style={{ border: "4px solid #f1f5f9" }}>
                        <IconUser size={50} />
                      </Avatar>
                    </Skeleton>

                    <ActionIcon
                      variant="filled"
                      color="indigo"
                      size="lg"
                      radius="xl"
                      onClick={() => document.getElementById("avatar-input")?.click()}
                      style={{ position: "absolute", bottom: 5, right: 5, border: "3px solid white" }}
                    >
                      <IconCamera size={18} />
                    </ActionIcon>
                  </Box>

                  <Box ta="center">
                    <Skeleton visible={fetching} height={20} mb={10} mx="auto">
                      <Text fw={700} size="lg">
                        {name || "Guest"}
                      </Text>
                    </Skeleton>
                    <Skeleton visible={fetching} height={15} width={180} mx="auto">
                      <Text size="sm" c="dimmed">
                        {email}
                      </Text>
                    </Skeleton>
                  </Box>

                  <Divider w="100%" label="Avatar" labelPosition="center" />

                  <Text size="xs" ta="center" c="dimmed">
                    Use a photo in JPG or PNG format. Max 2MB.
                  </Text>

                  <FileInput id="avatar-input" accept="image/*" value={file} onChange={setFile} style={{ display: "none" }} />
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                <Paper p="md" radius="xs" withBorder shadow="sm">
                  <Title order={4} mb="lg" fw={700}>
                    Account Information
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      label="Full name"
                      placeholder="Enter your name"
                      styles={inputStyles}
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      radius="xs"
                    />
                    <TextInput
                      label="Email"
                      placeholder="email@example.com"
                      leftSection={<IconMail size={16} />}
                      styles={inputStyles}
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      radius="xs"
                    />
                  </SimpleGrid>
                </Paper>

                <Paper p="md" radius="xs" withBorder shadow="sm">
                  <Title order={4} mb="lg" fw={700}>
                    Social Media
                  </Title>
                  <Stack gap="md">
                    <TextInput
                      label="Facebook"
                      placeholder="facebook.com/username"
                      leftSection={<IconBrandFacebook size={18} color="#1877F2" />}
                      styles={inputStyles}
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.currentTarget.value)}
                      radius="xs"
                    />
                    <TextInput
                      label="Instagram"
                      placeholder="instagram.com/username"
                      leftSection={<IconBrandInstagram size={18} color="#E4405F" />}
                      styles={inputStyles}
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.currentTarget.value)}
                      radius="xs"
                    />
                    <TextInput
                      label="X / Twitter"
                      placeholder="twitter.com/username"
                      leftSection={<IconBrandTwitter size={18} color="#000000" />}
                      styles={inputStyles}
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.currentTarget.value)}
                      radius="xs"
                    />
                  </Stack>
                </Paper>

                <Group justify="flex-end">
                  <Button size="md" radius="md" color="dark" leftSection={<IconDeviceFloppy size={20} />} loading={loading} onClick={handleUpdate}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      <FooterSection />
    </Box>
  );
};
