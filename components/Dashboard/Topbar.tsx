"use client";

import { NotificationDto } from "@/types/dtos/NotificationDto";
import { formatDate } from "@/utils";
import { ActionIcon, Box, Container, Flex, Group, Indicator, Loader, Menu, ScrollArea, Text, Tooltip, rem } from "@mantine/core";
import { IconBell, IconChecks, IconRefresh } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { ProfileTopbar } from "../layout/ProfileTopbar";

const Topbar = () => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotif(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  async function markAsRead(id: string, url?: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Gagal update status baca:", error);
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
    } catch (error) {
      console.error("Gagal mark all as read:", error);
    }
  }

  useEffect(() => {
    if (session?.user) fetchNotifications();
  }, [session, fetchNotifications]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchNotifications();
  };

  return (
    <Container fluid h={rem(70)} py="xs">
      <Flex align="center" justify="flex-end" h="100%">
        {status === "loading" ? (
          <Loader size="xs" type="dots" />
        ) : (
          <Group gap="md">
            <Menu shadow="lg" width={350} position="bottom-end" transitionProps={{ transition: "pop-top-right" }} withinPortal>
              <Menu.Target>
                <Indicator inline disabled={unreadCount === 0} label={unreadCount} size={16} color="red.6" offset={2} withBorder>
                  <ActionIcon variant="subtle" color="gray.7" size="lg" radius="md">
                    <IconBell size={22} stroke={1.5} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown
                styles={{
                  dropdown: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                    borderTop: "3px solid var(--mantine-color-blue-6)",
                  },
                }}
              >
                <Box p="xs" style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                  <Flex justify="space-between" align="center">
                    <Text size="xs" fw={800} tt="uppercase" lts={1} c="gray.7">
                      Notification
                    </Text>

                    <Group gap={5}>
                      {unreadCount > 0 && (
                        <Tooltip label="Mark all as read" position="top" withArrow>
                          <ActionIcon variant="subtle" size="sm" onClick={markAllAsRead} color="blue">
                            <IconChecks size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label="Refresh" position="top" withArrow>
                        <ActionIcon variant="subtle" size="sm" onClick={handleRefresh} loading={loadingNotif} color="gray">
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Flex>
                </Box>

                <Menu.Divider m={0} />

                <ScrollArea.Autosize mah={400} type="hover">
                  {loadingNotif && notifications.length === 0 ? (
                    <Flex justify="center" p="xl">
                      <Loader size="sm" type="dots" />
                    </Flex>
                  ) : notifications.length === 0 ? (
                    <Box py="xl" px="md">
                      <Text size="sm" c="dimmed" ta="center">
                        Tidak ada notifikasi baru
                      </Text>
                    </Box>
                  ) : (
                    notifications.map((notif) => (
                      <Menu.Item
                        key={notif.id}
                        onClick={() => markAsRead(notif.id, notif.url)}
                        p="sm"
                        style={{
                          borderBottom: "1px solid var(--mantine-color-gray-1)",
                          backgroundColor: !notif.isRead ? "var(--mantine-color-blue-0)" : "transparent",
                        }}
                      >
                        <Flex align="flex-start" gap="sm">
                          <Box mt={6}>
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: !notif.isRead ? "var(--mantine-color-blue-6)" : "transparent",
                                border: !notif.isRead ? "none" : "1px solid var(--mantine-color-gray-4)",
                              }}
                            />
                          </Box>

                          <Box style={{ flex: 1 }}>
                            <Flex justify="space-between" align="flex-start" mb={2}>
                              <Text size="sm" fw={notif.isRead ? 600 : 800} c={notif.isRead ? "gray.7" : "dark"}>
                                {notif.title}
                              </Text>
                              <Text size="10px" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                                {formatDate(notif.createdAt)}
                              </Text>
                            </Flex>

                            <Text size="xs" c={notif.isRead ? "dimmed" : "gray.8"} lineClamp={2}>
                              {notif.message}
                            </Text>
                          </Box>
                        </Flex>
                      </Menu.Item>
                    ))
                  )}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>

            <ProfileTopbar />
          </Group>
        )}
      </Flex>
    </Container>
  );
};

export default Topbar;
