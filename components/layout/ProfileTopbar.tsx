"use client";

import { Avatar, Box, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconLayoutDashboard, IconLogin, IconLogout, IconReceipt2, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  canAccessDashboard?: boolean;
}

export const ProfileTopbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const user = session?.user as ExtendedUser | undefined;

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : undefined;

  return (
    <Menu shadow="xl" width={248} position="bottom-end" transitionProps={{ transition: "pop-top-right", duration: 150 }}>
      <Menu.Target>
        <UnstyledButton style={{ borderRadius: 8, padding: "4px 6px" }} className="profile-topbar-btn">
          <style jsx global>{`
            .profile-topbar-btn:hover {
              background: var(--mantine-color-gray-0);
            }
            .profile-topbar-btn {
              transition: background 0.15s ease;
            }
          `}</style>

          <Group gap={8} wrap="nowrap">
            <Avatar
              color="blue"
              radius="xl"
              size={34}
              src={user?.avatar ?? undefined}
              style={{
                border: isAuthenticated ? "2px solid var(--mantine-color-blue-3)" : "2px solid var(--mantine-color-gray-3)",
              }}
            >
              {initials ?? <IconUser size={16} stroke={1.5} />}
            </Avatar>

            <Box style={{ lineHeight: 1 }}>
              <Text size="xs" fw={700} c="dark" lh={1.2} maw={120} truncate>
                {isAuthenticated ? (user?.name ?? "User") : "Guest"}
              </Text>
              <Text size="10px" c="dimmed" lh={1.4} style={{ fontSize: 10 }}>
                {isAuthenticated ? "Account" : "Tap to login"}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        <Box px="xs" py={6}>
          <Group gap={10} wrap="nowrap">
            <Avatar
              color="blue"
              radius="xl"
              size={38}
              src={user?.avatar ?? undefined}
              style={{
                border: isAuthenticated ? "2px solid var(--mantine-color-blue-3)" : "2px solid var(--mantine-color-gray-3)",
                flexShrink: 0,
              }}
            >
              {initials ?? <IconUser size={18} stroke={1.5} />}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={700} truncate>
                {isAuthenticated ? (user?.name ?? "User") : "Guest Session"}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {isAuthenticated ? (user?.email ?? "") : "Welcome to Toko Kartu"}
              </Text>
            </Box>
          </Group>
        </Box>

        <Menu.Divider my={6} />
        <Menu.Label>Menu</Menu.Label>

        {isAuthenticated && (
          <>
            <Menu.Item leftSection={<IconUser size={15} />} onClick={() => router.push("/profile")}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconReceipt2 size={15} />} onClick={() => router.push("/my-transaction")}>
              My Transactions
            </Menu.Item>
          </>
        )}

        <Menu.Item leftSection={<IconLayoutDashboard size={15} />} onClick={() => router.push("/Catalog")}>
          Collections
        </Menu.Item>

        {isAuthenticated && user?.canAccessDashboard && (
          <>
            <Menu.Divider my={6} />
            <Menu.Label>Administration</Menu.Label>
            <Menu.Item leftSection={<IconLayoutDashboard size={15} />} onClick={() => router.push("/dashboard/main")} color="blue">
              Admin Dashboard
            </Menu.Item>
          </>
        )}

        <Menu.Divider my={6} />

        {isAuthenticated ? (
          <Menu.Item color="red" leftSection={<IconLogout size={15} />} onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </Menu.Item>
        ) : (
          <Menu.Item color="blue" leftSection={<IconLogin size={15} />} onClick={() => router.push("/login")}>
            Login
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
