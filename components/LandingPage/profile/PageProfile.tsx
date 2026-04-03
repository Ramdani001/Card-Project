"use client";

import { Avatar, Box, Button, FileInput, Group, LoadingOverlay, Paper, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconCamera, IconCheck, IconDeviceFloppy, IconUser } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const PageProfile = () => {
  const { data: session, status } = useSession();

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
        notifications.show({ title: "Error", message: "Failed to fetch profile data", color: "red" });
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
      return notifications.show({ title: "File too large", message: "Maximum size is 2MB", color: "orange" });
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
        notifications.show({
          title: "Success",
          message: "Profile updated successfully!",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        setFile(null);
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      notifications.show({ title: "Failed", message: error.message || "Server Error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .profile-field input {
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .profile-field input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .save-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
          border-radius: 12px !important;
          height: 48px !important;
          font-weight: 600 !important;
          width: 100%;
        }
        @media (min-width: 768px) {
          .save-btn { width: auto; padding: 0 40px !important; }
        }
        .section-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e8eaf0;
          padding: 24px;
        }
      `}</style>

      <Box pos="relative" style={{ maxWidth: 800, margin: "0 auto" }}>
        <LoadingOverlay visible={fetching || status === "loading"} overlayProps={{ blur: 2, radius: 16 }} />

        <Box mb={30}>
          <Title order={3} fw={800} c="#1e1b4b">
            Profile
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Update your personal information.
          </Text>
        </Box>

        <Stack gap="xl">
          <Paper className="section-card" withBorder={false}>
            <Group gap={25} align="center" wrap="wrap">
              <Box pos="relative" style={{ display: "inline-block" }}>
                <Box p={3} style={{ borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a5b4fc)" }}>
                  <Avatar src={previewUrl} size={100} radius="100%" style={{ border: "3px solid white" }}>
                    {name ? name[0].toUpperCase() : <IconUser size={40} />}
                  </Avatar>
                </Box>
                <Button
                  p={0}
                  onClick={() => document.getElementById("avatar-input")?.click()}
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#6366f1",
                    border: "2px solid white",
                    zIndex: 2,
                  }}
                >
                  <IconCamera size={16} color="white" />
                </Button>
              </Box>

              <Box>
                <Text fw={700} size="lg">
                  {name || "Display Name"}
                </Text>
                <Text size="sm" c="dimmed">
                  {email || "email@example.com"}
                </Text>
                <Text size="xs" c="indigo.6" fw={600} mt={8}>
                  JPG, PNG (Max 2MB)
                </Text>
              </Box>

              <FileInput id="avatar-input" accept="image/*" value={file} onChange={setFile} style={{ display: "none" }} />
            </Group>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper className="section-card">
              <Text fw={700} size="sm" mb={20} c="#1e1b4b">
                Basic Information
              </Text>
              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  className="profile-field"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
                <TextInput
                  label="Email Address"
                  className="profile-field"
                  placeholder="hello@world.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </Stack>
            </Paper>

            <Paper className="section-card">
              <Text fw={700} size="sm" mb={20} c="#1e1b4b">
                Social Media Presence
              </Text>
              <Stack gap="sm">
                <TextInput
                  className="profile-field"
                  placeholder="facebook.com/username"
                  leftSection={<IconBrandFacebook size={18} color="#1877F2" />}
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.currentTarget.value)}
                />
                <TextInput
                  className="profile-field"
                  placeholder="instagram.com/username"
                  leftSection={<IconBrandInstagram size={18} color="#E4405F" />}
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.currentTarget.value)}
                />
                <TextInput
                  className="profile-field"
                  placeholder="twitter.com/username"
                  leftSection={<IconBrandTwitter size={18} color="#1DA1F2" />}
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.currentTarget.value)}
                />
              </Stack>
            </Paper>
          </SimpleGrid>

          <Box>
            <Button className="save-btn" onClick={handleUpdate} loading={loading} leftSection={<IconDeviceFloppy size={20} />}>
              Save Changes
            </Button>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
