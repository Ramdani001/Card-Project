"use client";

import { Avatar, Box, Button, FileInput, Group, LoadingOverlay, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCamera, IconCheck, IconDeviceFloppy, IconMail, IconUser } from "@tabler/icons-react";
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
        notifications.show({ title: "Error", message: "Gagal mengambil data", color: "red" });
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
      return notifications.show({ title: "File Terlalu Besar", message: "Ukuran maksimal adalah 2MB", color: "orange" });
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
        notifications.show({ title: "Berhasil", message: "Profil berhasil diperbarui!", color: "teal", icon: <IconCheck size={16} /> });
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
    <>
      <style>{`
        .profile-field input {
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-field input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .save-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
          border: none !important;
          border-radius: 12px !important;
          height: 46px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.35) !important;
        }

        .avatar-ring {
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #6366f1, #a5b4fc);
        }

        .avatar-upload-trigger {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99,102,241,0.4);
          border: 2px solid white;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e8eaf0;
          padding: 28px;
        }

        .social-icon-wrap {
          border-radius: 8px;
          padding: 4px 6px;
          display: flex;
          align-items: center;
        }
      `}</style>

      <Box className="profile-wrap" w="100%" pos="relative" style={{ maxWidth: 760 }}>
        <LoadingOverlay visible={fetching || status === "loading"} overlayProps={{ blur: 2, radius: 16 }} />

        <Box mb={28}>
          <Title order={3} fw={800} style={{ color: "#1e1b4b" }}>
            Edit Profil
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Perbarui informasi dan tampilan kartu developer kamu
          </Text>
        </Box>

        <Stack gap={16}>
          <div className="section-card">
            <Group gap={24} align="center">
              <Box style={{ position: "relative", display: "inline-block" }}>
                <div className="avatar-ring">
                  <Avatar src={previewUrl} size={80} radius="50%" style={{ border: "2px solid white" }}>
                    {name ? name[0].toUpperCase() : "?"}
                  </Avatar>
                </div>
                <div className="avatar-upload-trigger" onClick={() => document.getElementById("avatar-input")?.click()}>
                  <IconCamera size={14} color="white" />
                </div>
              </Box>

              <Box style={{ flex: 1 }}>
                <Text fw={700} size="sm" c="#1e1b4b">
                  {name || "Nama belum diisi"}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {email || "Email belum diisi"}
                </Text>
                <Text size="xs" c="dimmed" mt={8}>
                  JPG / PNG · Maks 2MB
                </Text>
              </Box>

              <FileInput id="avatar-input" accept="image/png,image/jpeg" value={file} onChange={setFile} clearable style={{ display: "none" }} />

              {file && (
                <Box
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <ThemeIcon color="teal" variant="light" size="sm" radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                  <Text size="xs" c="teal.7" fw={600}>
                    {file.name}
                  </Text>
                </Box>
              )}
            </Group>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="section-card">
              <Text fw={700} size="sm" c="#1e1b4b" mb={16}>
                Informasi Dasar
              </Text>
              <Stack gap="md">
                <TextInput
                  className="profile-field"
                  label="Nama Lengkap"
                  placeholder="John Doe"
                  withAsterisk
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftSection={<IconUser size={15} color="#6366f1" />}
                  styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 13 } }}
                />
                <TextInput
                  className="profile-field"
                  label="Alamat Email"
                  placeholder="john@example.com"
                  withAsterisk
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftSection={<IconMail size={15} color="#6366f1" />}
                  styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 13 } }}
                />
              </Stack>
            </div>

            <div className="section-card">
              <Text fw={700} size="sm" c="#1e1b4b" mb={16}>
                Sosial Media
              </Text>
              <Stack gap="md">
                {[
                  {
                    label: "Facebook",
                    val: facebookUrl,
                    set: setFacebookUrl,
                    bg: "#eff6ff",
                    placeholder: "facebook.com/username",
                  },
                  {
                    label: "Instagram",
                    val: instagramUrl,
                    set: setInstagramUrl,
                    bg: "#fff1f2",
                    placeholder: "instagram.com/username",
                  },
                  {
                    label: "Twitter / X",
                    val: twitterUrl,
                    set: setTwitterUrl,
                    bg: "#eff6ff",
                    placeholder: "twitter.com/username",
                  },
                ].map((s) => (
                  <TextInput
                    key={s.label}
                    className="profile-field"
                    label={s.label}
                    placeholder={s.placeholder}
                    value={s.val}
                    onChange={(e) => s.set(e.target.value)}
                    styles={{
                      label: { fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: 13 },
                      section: { width: 40, paddingLeft: 8 },
                    }}
                  />
                ))}
              </Stack>
            </div>
          </div>

          <Box>
            <Button
              className="save-btn"
              onClick={handleUpdate}
              loading={loading}
              disabled={status !== "authenticated"}
              leftSection={<IconDeviceFloppy size={16} />}
              loaderProps={{ type: "dots" }}
            >
              Simpan Perubahan
            </Button>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
