"use client";

import { Paper, rem, Tabs, Text } from "@mantine/core";
import { IconCalendarEvent, IconCards, IconCategory, IconDiscount, IconLayoutGrid, IconPhoto, IconTicket } from "@tabler/icons-react";

import ListBanner from "./Collection/Banner/ListBanner";
import ListCard from "@/components/Dashboard/Collection/Card/ListCard";
import ListTypeCard from "@/components/Dashboard/Collection/Category/ListCategory";
import ListDiscount from "@/components/Dashboard/Collection/Discount/ListDiscount";
import ListEvent from "@/components/Dashboard/Collection/Event/ListEvent";
import ListMenu from "@/components/Dashboard/Collection/Menu/ListMenu";
import ListVoucher from "./Collection/Voucher/ListVoucher";

const Collection = () => {
  const iconStyle = { width: rem(20), height: rem(20) };

  const tabList = [
    { value: "card", label: "Card", icon: IconCards, component: <ListCard /> },
    { value: "type-card", label: "Category Card", icon: IconCategory, component: <ListTypeCard /> },
    { value: "event", label: "Event", icon: IconCalendarEvent, component: <ListEvent /> },
    { value: "discount", label: "Discount", icon: IconDiscount, component: <ListDiscount /> },
    { value: "menu", label: "Menu", icon: IconLayoutGrid, component: <ListMenu /> },
    { value: "banner", label: "Banner", icon: IconPhoto, component: <ListBanner /> },
    { value: "voucher", label: "Voucher", icon: IconTicket, component: <ListVoucher /> },
  ];

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
            scrollbarWidth: "none",
          }}
        >
          {tabList.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon style={iconStyle} />}>
              <Text span visibleFrom="sm">
                {tab.label}
              </Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabList.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value}>
            {tab.component}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
};

export default Collection;
