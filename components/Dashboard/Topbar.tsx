"use client";

import { NotificationDto } from "@/types/dtos/NotificationDto";
import { Avatar, Container, Flex, Group, Indicator, Loader, Menu, ScrollArea, Text, UnstyledButton, rem } from "@mantine/core";

import { IconBell, IconChevronDown, IconLogout, IconRefresh, IconSettings, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (session?.user) fetchNotifications();
  }, [session]);

  return (
    <Container fluid h="100%" py="xs">
      <Flex align="center" justify="space-between" h="100%">
        <h3 style={{ margin: 0 }}></h3>

        {status === "loading" ? (
          <Loader size="xs" />
        ) : (
          <Group>
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

                  <IconRefresh size={16} style={{ cursor: "pointer" }} onClick={fetchNotifications} />
                </Flex>

                {loadingNotif ? (
                  <Flex justify="center" p="sm">
                    <Loader size="xs" />
                  </Flex>
                ) : notifications.length === 0 ? (
                  <Text size="sm" p="sm" c="dimmed">
                    No notifications
                  </Text>
                ) : (
                  <ScrollArea h={250}>
                    {notifications.map((notif) => (
                      <Menu.Item key={notif.id} onClick={() => markAsRead(notif.id, notif.url)}>
                        <Flex align="flex-start" gap="xs">
                          {!notif.isRead && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#228be6",
                                marginTop: 6,
                              }}
                            />
                          )}

                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={notif.isRead ? 400 : 600}>
                              {notif.title}
                            </Text>

                            <Text size="xs" c="dimmed">
                              {notif.message}
                            </Text>
                          </div>
                        </Flex>
                      </Menu.Item>
                    ))}
                  </ScrollArea>
                )}
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: "pop-top-right" }}>
              <Menu.Target>
                <UnstyledButton style={{ padding: "5px", borderRadius: "4px" }}>
                  <Group gap={10}>
                    <Avatar src={session?.user?.avatar} radius="xl" size={36} color="blue">
                      {session?.user?.email?.charAt(0).toUpperCase()}
                    </Avatar>

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <Text size="sm" fw={600} lineClamp={1}>
                        {session?.user?.name || "User"}
                      </Text>

                      <Text size="xs" c="dimmed" truncate="end" w={130}>
                        {session?.user?.email}
                      </Text>

                      <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                        {session?.user?.role || "User"}
                      </Text>
                    </div>

                    <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Settings</Menu.Label>

                <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}>Profile</Menu.Item>

                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>Account settings</Menu.Item>

                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Flex>
    </Container>
  );
};

export default Topbar;
