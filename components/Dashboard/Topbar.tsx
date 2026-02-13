"use client";

import { Container, Flex, Group, Menu, Avatar, Text, UnstyledButton, rem, Loader } from "@mantine/core";
import { useSession, signOut } from "next-auth/react";
import { IconLogout, IconChevronDown, IconSettings, IconUser } from "@tabler/icons-react";

const Topbar = () => {
  const { data: session, status } = useSession();

  return (
    <Container fluid h="100%" py="xs">
      <Flex align="center" justify="space-between" h="100%">
        <h3 style={{ margin: 0 }}></h3>

        {status === "loading" ? (
          <Loader size="xs" />
        ) : (
          <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: "pop-top-right" }}>
            <Menu.Target>
              <UnstyledButton style={{ padding: "5px", borderRadius: "4px" }}>
                <Group gap={10}>
                  <Avatar src={session?.user?.image} radius="xl" size={36} color="blue">
                    {session?.user?.email?.charAt(0).toUpperCase()}
                  </Avatar>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <Text size="sm" fw={600}>
                      {session?.user?.name || session?.user?.email}
                    </Text>

                    <Text size="xs" c="dimmed">
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
        )}
      </Flex>
    </Container>
  );
};

export default Topbar;
