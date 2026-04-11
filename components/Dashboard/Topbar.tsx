"use client";

import { NotificationDto } from "@/types/dtos/NotificationDto";
import { formatDate } from "@/utils";
import { Box, Container, Flex, Group, Indicator, Loader, Menu, ScrollArea, Text, UnstyledButton, rem } from "@mantine/core";
import { IconBell, IconRefresh } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ProfileTopbar } from "../layout/ProfileTopbar";

const Topbar = () => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function fetchNotifications() {
    try {
      setLoadingNotif(true);
      const res = await fetch("/api/notifications");
      const responseData = await res.json();
      setNotifications(responseData.data);
    } finally {
      setLoadingNotif(false);
    }
  }

  async function markAsRead(id: string, url?: string) {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (url) window.location.href = url;
  }

  async function markAllAsRead() {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  useEffect(() => {
    if (session?.user) fetchNotifications();
  }, [session]);

  return (
    <Container fluid h="100%" py="xs">
      <Flex align="center" justify="flex-end" h="100%">
        {status === "loading" ? (
          <Loader size="xs" />
        ) : (
          <Group gap="sm">
            <Menu shadow="md" width={320} position="bottom-end">
              <Menu.Target>
                <Indicator inline disabled={unreadCount === 0} label={unreadCount} size={16}>
                  <UnstyledButton>
                    <IconBell style={{ width: rem(22), height: rem(22) }} />
                  </UnstyledButton>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown>
                <Flex justify="space-between" align="center" px="sm" py={6}>
                  <Menu.Label style={{ padding: 0 }}>Notifications</Menu.Label>

                  <Flex gap="xs" align="center">
                    {unreadCount > 0 && (
                      <Text size="xs" c="blue" style={{ cursor: "pointer", fontWeight: 500 }} onClick={markAllAsRead}>
                        Mark all as read
                      </Text>
                    )}
                    <IconRefresh size={16} style={{ cursor: "pointer", color: "var(--mantine-color-dimmed)" }} onClick={fetchNotifications} />
                  </Flex>
                </Flex>

                <Menu.Divider />

                {loadingNotif ? (
                  <Flex justify="center" p="sm">
                    <Loader size="xs" />
                  </Flex>
                ) : notifications.length === 0 ? (
                  <Text size="sm" p="sm" c="dimmed" ta="center">
                    No notifications
                  </Text>
                ) : (
                  <ScrollArea h={250}>
                    {notifications.length === 0 ? (
                      <Menu.Item disabled>
                        <Text size="sm" c="dimmed" ta="center" py="sm">
                          No notifications
                        </Text>
                      </Menu.Item>
                    ) : (
                      notifications.map((notif) => (
                        <Menu.Item key={notif.id} onClick={() => markAsRead(notif.id, notif.url)}>
                          <Flex align="flex-start" gap="md">
                            <Box mt={7} style={{ flexShrink: 0 }}>
                              <Box
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: !notif.isRead ? "#228be6" : "transparent",
                                  border: !notif.isRead ? "none" : "1px solid #dee2e6",
                                }}
                              />
                            </Box>

                            <Box style={{ flex: 1 }}>
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text size="sm" fw={notif.isRead ? 500 : 700} c={notif.isRead ? "dimmed" : "dark"}>
                                  {notif.title}
                                </Text>

                                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", marginLeft: 8 }}>
                                  {formatDate(notif.createdAt)}
                                </Text>
                              </Flex>

                              <Text size="xs" c={notif.isRead ? "dimmed" : "gray.7"} lineClamp={2}>
                                {notif.message}
                              </Text>
                            </Box>
                          </Flex>
                        </Menu.Item>
                      ))
                    )}
                  </ScrollArea>
                )}
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
