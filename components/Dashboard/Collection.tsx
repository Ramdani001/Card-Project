"use client";

import ListCard from "@/components/Dashboard/Collection/Card/ListCard";
import ListDiscount from "@/components/Dashboard/Collection/Discount/ListDiscount";
import ListEvent from "@/components/Dashboard/Collection/Event/ListEvent";
import ListMenu from "@/components/Dashboard/Collection/Menu/ListMenu";
import ListTypeCard from "@/components/Dashboard/Collection/Category/ListCategory";
import { Paper, Tabs, rem, Text } from "@mantine/core";
import { IconCalendarEvent, IconCardboards, IconCards, IconDiscount, IconList } from "@tabler/icons-react";

const Collection = () => {
  const iconStyle = { width: rem(20), height: rem(20) };

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Tabs defaultValue="card" variant="outline" keepMounted={false}>
        <Tabs.List
          mb="md"
          style={{
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <Tabs.Tab value="card" leftSection={<IconCards style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Card Management
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="type-card" leftSection={<IconCardboards style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Category Card
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="event" leftSection={<IconCalendarEvent style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Event Management
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="discount" leftSection={<IconDiscount style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Discount Management
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="menu" leftSection={<IconList style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Menu Management
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="menu">
          <ListMenu />
        </Tabs.Panel>
        <Tabs.Panel value="event">
          <ListEvent />
        </Tabs.Panel>
        <Tabs.Panel value="card">
          <ListCard />
        </Tabs.Panel>
        <Tabs.Panel value="discount">
          <ListDiscount />
        </Tabs.Panel>
        <Tabs.Panel value="type-card">
          <ListTypeCard />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default Collection;
