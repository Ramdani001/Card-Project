"use client";

import {
  Alert,
  Anchor,
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Divider,
  FileInput,
  Group,
  Paper,
  PasswordInput,
  rem,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconLock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  const fileInputRef = useRef<HTMLButtonElement>(null);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      file: null as File | null,
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name is too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      phone: (value) => (/^\d{9,15}$/.test(value) ? null : "Invalid phone number"),
      password: (value) => (value.length < 8 ? "Password must be at least 8 characters" : null),
    },
  });

  useEffect(() => {
    if (form.values.file) {
      const objectUrl = URL.createObjectURL(form.values.file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [form.values.file]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="#f8f9fa" mih="100vh" py={rem(60)} style={{ display: "flex", alignItems: "center" }}>
      <Container size={500}>
        <Paper p={rem(40)} radius="xs" withBorder shadow="sm" bg="white">
          <Stack gap="xs" mb={rem(30)}>
            <Title order={2} fw={800} style={{ color: "#212529", letterSpacing: rem(-0.5) }}>
              Create Account
            </Title>
            <Text c="dimmed" size="sm">
              Complete the form below to become a member
            </Text>
          </Stack>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="xl" radius="xs" variant="light">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Center mb="md">
                <Stack align="center" gap="xs">
                  <Box style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                    <Avatar src={preview} size={100} radius={100} style={{ border: "2px solid #eee" }}>
                      <IconUser size={40} stroke={1.5} />
                    </Avatar>
                    <Box
                      style={{
                        position: "absolute",
                        bottom: 5,
                        right: 5,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        padding: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        border: "1px solid #eee",
                        display: "flex",
                      }}
                    >
                      <IconUpload size={14} color="#495057" />
                    </Box>
                  </Box>
                  <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: rem(0.5) }}>
                    {preview ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
                  </Text>
                </Stack>
              </Center>

              <FileInput
                ref={fileInputRef}
                label="Profile Picture"
                placeholder="Choose image"
                accept="image/png,image/jpeg"
                radius="xs"
                leftSection={<IconUpload size={16} />}
                {...form.getInputProps("file")}
                style={{ display: preview ? "none" : "block" }}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label="Full Name"
                  placeholder="Your Name"
                  required
                  radius="xs"
                  leftSection={<IconUser size={16} stroke={1.5} />}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  label="Phone Number"
                  placeholder="08123456789"
                  required
                  radius="xs"
                  leftSection={<IconPhone size={16} stroke={1.5} />}
                  {...form.getInputProps("phone")}
                />
              </SimpleGrid>

              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                required
                radius="xs"
                leftSection={<IconMail size={16} stroke={1.5} />}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Minimum 8 characters"
                required
                radius="xs"
                leftSection={<IconLock size={16} stroke={1.5} />}
                {...form.getInputProps("password")}
              />

              <Textarea
                label="Shipping Address"
                placeholder="Street name, City, Zip Code"
                minRows={3}
                radius="xs"
                leftSection={<IconMapPin size={16} stroke={1.5} />}
                {...form.getInputProps("address")}
              />

              <Divider label="Social Media (Optional)" labelPosition="center" my="sm" />

              <Stack gap="sm">
                <TextInput
                  label="Facebook"
                  placeholder="https://facebook.com/username"
                  radius="xs"
                  leftSection={<IconBrandFacebook size={16} color="#1877F2" />}
                  {...form.getInputProps("facebookUrl")}
                />
                <TextInput
                  label="Instagram"
                  placeholder="https://instagram.com/username"
                  radius="xs"
                  leftSection={<IconBrandInstagram size={16} color="#E4405F" />}
                  {...form.getInputProps("instagramUrl")}
                />
                <TextInput
                  label="Twitter / X"
                  placeholder="https://twitter.com/username"
                  radius="xs"
                  leftSection={<IconBrandTwitter size={16} color="#1A1B1E" />}
                  {...form.getInputProps("twitterUrl")}
                />
              </Stack>

              <Button type="submit" color="dark" fullWidth size="md" radius="xs" mt="xl" loading={loading}>
                Create Account
              </Button>

              <Group justify="center" mt="md">
                <Text size="sm" c="dimmed">
                  Already have an account?{" "}
                  <Anchor component={Link} href="/login" size="sm" fw={700} c="dark">
                    Login
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
