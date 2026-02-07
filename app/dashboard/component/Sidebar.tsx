"use client";

import { Button, Divider, Stack, Text } from "@mantine/core";
import { IconLayoutDashboard, IconLibraryPhoto, IconUsers } from "@tabler/icons-react";

type SidebarProps = {
  onMenuClick: (menuName: string) => void;
  activeMenu: string;
};

const Sidebar = ({ onMenuClick, activeMenu }: SidebarProps) => {
  const getButtonProps = (menuName: string) => {
    const isActive = activeMenu === menuName;
    return {
      variant: isActive ? "light" : "subtle",
      color: isActive ? "blue" : "gray",
      c: isActive ? "blue.2" : "gray.3",
    };
  };

  return (
    <>
      <Text size="xl" fw={700} ta="center" mb="md" mt="sm" c="white">
        Card Royal
      </Text>
      <Divider mb="lg" color="gray.8" />

      <Stack gap="sm" px="md">
        <Button
          fullWidth
          justify="flex-start"
          leftSection={<IconLayoutDashboard size={20} />}
          onClick={() => onMenuClick("Dashboard")}
          {...getButtonProps("Dashboard")}
        >
          Dashboard
        </Button>

        <Button
          fullWidth
          justify="flex-start"
          leftSection={<IconLibraryPhoto size={20} />}
          onClick={() => onMenuClick("Collection")}
          {...getButtonProps("Collection")}
        >
          Collection
        </Button>

        <Button
          fullWidth
          justify="flex-start"
          leftSection={<IconUsers size={20} />}
          onClick={() => onMenuClick("ListMember")}
          {...getButtonProps("ListMember")}
        >
          List Member
        </Button>
      </Stack>
    </>
  );
};

export default Sidebar;
