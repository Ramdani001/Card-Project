import { Avatar, Box, Button, Group, Menu, rem, Text, UnstyledButton } from "@mantine/core";
import { IconLayoutDashboard, IconLogin, IconLogout, IconReceipt2, IconUser } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const ProfileTopbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  return status === "authenticated" ? (
    <Menu shadow="xl" width={240} position="bottom-end" transitionProps={{ transition: "pop-top-right" }}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={10}>
            <Avatar color="blue" radius="xl" size="md" src={session?.user?.avatar}>
              {session?.user?.name?.[0].toUpperCase()}
            </Avatar>
            <Box visibleFrom="sm">
              <Text size="xs" fw={800} c="dark" lh={1}>
                {session?.user?.name}
              </Text>
              <Text size="10px" c="dimmed">
                Account Settings
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        <Box px="sm" py="xs">
          <Text size="xs" c="dimmed">
            Signed in as
          </Text>
          <Text size="sm" fw={700} truncate>
            {session?.user?.email}
          </Text>
        </Box>
        <Menu.Divider />

        <Menu.Label>My Account</Menu.Label>
        <Menu.Item leftSection={<IconUser size={16} />} onClick={() => router.push("/profile")}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<IconReceipt2 size={16} />} onClick={() => router.push("/my-transaction")}>
          My Transactions
        </Menu.Item>
        <Menu.Item leftSection={<IconLayoutDashboard size={16} />} onClick={() => router.push("/Catalog")}>
          Collections
        </Menu.Item>

        {(session?.user as any)?.canAccessDashboard && (
          <>
            <Menu.Divider />
            <Menu.Label>Administration</Menu.Label>
            <Menu.Item leftSection={<IconLayoutDashboard size={16} />} onClick={() => router.push("/dashboard/main")} color="blue" variant="filled">
              Admin Dashboard
            </Menu.Item>
          </>
        )}

        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : (
    <Button
      variant="outline"
      color="dark"
      size="sm"
      radius="xs"
      styles={{
        root: {
          borderWidth: rem(1.5),
          fontWeight: 600,
          transition: "transform 0.2s ease",
          "&:active": { transform: "scale(0.95)" },
        },
      }}
      leftSection={<IconLogin size={18} />}
      onClick={() => router.push("/login")}
    >
      Login
    </Button>
  );
};
