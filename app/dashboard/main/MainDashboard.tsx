"use client";

import { AppShell, Burger, Center, Drawer, Group, Loader, ScrollArea, Text } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Dashboard/Sidebar";
import Topbar from "../../../components/Dashboard/Topbar";
import { COMPONENT_MAP } from "@/config/menuMapping";

interface MenuData {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  subMenus: MenuData[];
}

const MainDashboard = () => {
  const [isMounted, setIsMounted] = useState(false);

  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [activeUrl, setActiveUrl] = useLocalStorage({
    key: "active-dashboard-url",
    defaultValue: "/dashboard",
  });

  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  useEffect(() => {
    setIsMounted(true);
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/menus/users");
        const json = await res.json();
        if (json.success) {
          setMenus(json.data);
        }
      } catch (error) {
        console.error("Gagal ambil menu:", error);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenus();
  }, []);

  if (!isMounted || loadingMenu) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
      layout="alt"
    >
      <AppShell.Header>
        <Group h="100%" px="md" wrap="nowrap">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <div style={{ flex: 1 }}>
            <Topbar />
          </div>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="#0f1536" c="white" visibleFrom="sm">
        <AppShell.Section grow component={ScrollArea}>
          <Sidebar menus={menus} activeMenu={activeUrl} onMenuClick={setActiveUrl} />
        </AppShell.Section>
      </AppShell.Navbar>

      <Drawer
        opened={mobileOpened}
        onClose={closeMobile}
        size="280px"
        padding="0"
        hiddenFrom="sm"
        withCloseButton={false}
        styles={{
          content: { backgroundColor: "#0f1536", color: "white" },
          body: { height: "100%", padding: "16px" },
        }}
        zIndex={1000}
      >
        <Sidebar
          menus={menus}
          activeMenu={activeUrl}
          onMenuClick={(url) => {
            setActiveUrl(url);
            closeMobile();
          }}
          onClose={closeMobile}
        />
      </Drawer>

      <AppShell.Main>
        {COMPONENT_MAP[activeUrl] || (
          <Center h="100%">
            <Text c="dimmed">404 - Page Not Found or Access Denied</Text>
          </Center>
        )}
      </AppShell.Main>
    </AppShell>
  );
};

export default MainDashboard;
