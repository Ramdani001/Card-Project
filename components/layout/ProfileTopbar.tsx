"use client";

import { Avatar, Box, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconLayoutDashboard, IconLogin, IconLogout, IconReceipt2, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const ProfileTopbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <Menu shadow="xl" width={240} position="bottom-end" transitionProps={{ transition: "pop-top-right" }}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={10}>
            <Avatar color="blue" radius="xl" size="md" src={session?.user?.avatar}>
              {isAuthenticated ? session?.user?.name?.[0].toUpperCase() : <IconUser size={20} stroke={1.5} />}
            </Avatar>
            <Box visibleFrom="sm">
              <Text size="xs" fw={800} c="dark" lh={1}>
                {isAuthenticated ? session?.user?.name : "Guest Menu"}
              </Text>
              <Text size="10px" c="dimmed">
                {isAuthenticated ? "Account Settings" : "Click to view options"}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        <Box px="sm" py="xs">
          <Text size="xs" c="dimmed">
            {isAuthenticated ? "Signed in as" : "Welcome to Toko Kartu"}
          </Text>
          <Text size="sm" fw={700} truncate>
            {isAuthenticated ? session?.user?.email : "Guest Session"}
          </Text>
        </Box>
        <Menu.Divider />

        <Menu.Label>Menu</Menu.Label>

        {isAuthenticated && (
          <>
            <Menu.Item leftSection={<IconUser size={16} />} onClick={() => router.push("/profile")}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconReceipt2 size={16} />} onClick={() => router.push("/my-transaction")}>
              My Transactions
            </Menu.Item>
          </>
        )}

        <Menu.Item leftSection={<IconLayoutDashboard size={16} />} onClick={() => router.push("/Catalog")}>
          Collections
        </Menu.Item>

        {isAuthenticated && (session?.user as any)?.canAccessDashboard && (
          <>
            <Menu.Divider />
            <Menu.Label>Administration</Menu.Label>
            <Menu.Item leftSection={<IconLayoutDashboard size={16} />} onClick={() => router.push("/dashboard/main")} color="blue" variant="filled">
              Admin Dashboard
            </Menu.Item>
          </>
        )}

        <Menu.Divider />

        {isAuthenticated ? (
          <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </Menu.Item>
        ) : (
          <Menu.Item color="blue" leftSection={<IconLogin size={16} />} onClick={() => router.push("/login")}>
            Login
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
