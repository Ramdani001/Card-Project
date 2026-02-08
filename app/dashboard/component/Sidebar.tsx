"use client";

import { ActionIcon, Box, Code, Divider, Group, NavLink, Stack, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconLayoutDashboard, IconLibraryPhoto, IconUsers, IconX } from "@tabler/icons-react";

type SidebarProps = {
  onMenuClick: (menuName: string) => void;
  activeMenu: string;
  onClose?: () => void;
};

const data = [
  { label: "Dashboard", icon: IconLayoutDashboard, id: "Dashboard" },
  { label: "Collection", icon: IconLibraryPhoto, id: "Collection" },
  { label: "List Member", icon: IconUsers, id: "ListMember" },
];

const Sidebar = ({ onMenuClick, activeMenu, onClose }: SidebarProps) => {
  const theme = useMantineTheme();

  const links = data.map((item) => (
    <NavLink
      key={item.label}
      active={item.id === activeMenu}
      label={item.label}
      leftSection={<item.icon size="1.2rem" stroke={1.5} />}
      onClick={() => {
        onMenuClick(item.id);
        if (onClose) onClose();
      }}
      variant="light"
      color="blue"
      styles={{
        root: {
          borderRadius: theme.radius.sm,
          marginBottom: 4,
          fontWeight: 500,
        },
        label: {
          fontSize: theme.fontSizes.sm,
        },
      }}
    />
  ));

  return (
    <Stack h="100%" justify="space-between" gap={0}>
      <Box>
        <Group justify="space-between" mb="md" px="md" mt="sm">
          <Group gap="xs">
            <ThemeIcon variant="gradient" gradient={{ from: "blue", to: "cyan" }} size="lg" radius="md">
              <Text fw={700} size="xs">
                CR
              </Text>
            </ThemeIcon>
            <Box>
              <Text size="md" fw={700} c="white" lh={1.2}>
                Card Royal
              </Text>
              <Code c="dimmed" style={{ fontSize: 10, background: "rgba(255,255,255,0.1)" }}>
                v1.0.0
              </Code>
            </Box>
          </Group>

          {onClose && (
            <ActionIcon variant="transparent" color="white" onClick={onClose} hiddenFrom="sm">
              <IconX size={24} />
            </ActionIcon>
          )}
        </Group>

        <Divider mb="md" color="gray.8" />

        <Box px="md">
          <Text size="xs" fw={500} c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: 1 }}>
            Main Menu
          </Text>
          {links}
        </Box>
      </Box>
    </Stack>
  );
};

export default Sidebar;
