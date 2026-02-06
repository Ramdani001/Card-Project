"use client";

import { useState } from "react";
import { AppShell, Burger, Group, ScrollArea, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Sidebar from "../component/Sidebar";
import Dashboard from "../component/Dashboard";
import Collection from "../component/Collection";
import Topbar from "../component/Topbar";

const MENU_COMPONENTS: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  Collection: <Collection />,
};

const MainDashboard = () => {
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const handleMenuChange = (menuName: string) => {
    setActiveMenu(menuName);
    if (mobileOpened) toggleMobile();
  };

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
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <div style={{ flex: 1 }}>
              <Topbar />
            </div>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="#0f1536" c="white">
        <AppShell.Section>
          <Text fw={700} size="xl" mb="md" ta="center">
            MY APP LOGO
          </Text>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          <Sidebar onMenuClick={handleMenuChange} activeMenu={activeMenu} />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{MENU_COMPONENTS[activeMenu] || <Text>Menu Not Found</Text>}</AppShell.Main>
    </AppShell>
  );
};

export default MainDashboard;
