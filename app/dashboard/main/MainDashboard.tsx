"use client";

import { useState } from "react";
import { AppShell, Burger, Drawer, Group, ScrollArea, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Sidebar from "../component/Sidebar";
import Dashboard from "../component/Dashboard/Dashboard";
import Collection from "../component/Collection";
import Topbar from "../component/Topbar";
import ListMember from "../component/ListMember/ListMember";
import ListTransaction from "@/components/Transaction/ListTransaction";

const MENU_COMPONENTS: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  Transactions: <ListTransaction />,
  Collection: <Collection />,
  ListMember: <ListMember />,
};

const MainDashboard = () => {
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const handleMenuChange = (menuName: string) => {
    setActiveMenu(menuName);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: true, desktop: !desktopOpened },
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
          <Sidebar onMenuClick={handleMenuChange} activeMenu={activeMenu} />
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
        <Sidebar onMenuClick={handleMenuChange} activeMenu={activeMenu} onClose={closeMobile} />
      </Drawer>

      <AppShell.Main>{MENU_COMPONENTS[activeMenu] || <Text>Menu Not Found</Text>}</AppShell.Main>
    </AppShell>
  );
};

export default MainDashboard;
