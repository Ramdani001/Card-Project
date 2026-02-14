import { ICON_MAP } from "@/config/menuMapping";
import { ActionIcon, Box, Code, Group, NavLink, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface MenuData {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  subMenus?: MenuData[];
}

interface SidebarProps {
  menus?: MenuData[];
  activeMenu: string;
  onMenuClick: (url: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ menus = [], activeMenu, onMenuClick, onClose }: SidebarProps) => {
  const renderNav = (item: MenuData) => {
    const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
    const subMenus = item.subMenus || [];
    const hasSubMenu = subMenus.length > 0;

    return (
      <NavLink
        key={item.id}
        label={item.label}
        leftSection={IconComponent ? <IconComponent size={20} stroke={1.5} /> : null}
        active={item.url === activeMenu}
        childrenOffset={28}
        defaultOpened={hasSubMenu}
        onClick={() => {
          if (!hasSubMenu && item.url) {
            onMenuClick(item.url);
            if (onClose) onClose();
          }
        }}
      >
        {hasSubMenu && subMenus.map((sub) => renderNav(sub))}
      </NavLink>
    );
  };

  if (!menus || menus.length === 0) {
    return (
      <Text size="xs" c="dimmed" p="md">
        No menu data
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" mb="md" px="md" mt="sm">
        <Group gap="xs">
          <ThemeIcon variant="gradient" gradient={{ from: "blue", to: "cyan" }} size="lg" radius="md">
            <Text fw={700} size="xs">
              CR
            </Text>
          </ThemeIcon>
          <Box>
            <Text size="md" fw={700} c="white" lh={1.2}>
              DEV CARD
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
      {menus.map((item) => renderNav(item))}
    </Stack>
  );
};

export default Sidebar;
