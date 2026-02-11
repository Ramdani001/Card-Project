"use client";

import { Paper, rem, Tabs, Text } from "@mantine/core";
import { IconPaperBag, IconUsers } from "@tabler/icons-react";
import ListMember from "./UserManagement/ListMember/ListMember";
import ListRole from "./UserManagement/ListRole/ListRole";
import ListRoleCategoryAccess from "./UserManagement/ListRoleCategoryAccess/ListRoleCategoryAccess";

const UserManagement = () => {
  const iconStyle = { width: rem(20), height: rem(20) };

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Tabs defaultValue="list-member" variant="outline" keepMounted={false}>
        <Tabs.List
          mb="md"
          style={{
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <Tabs.Tab value="list-member" leftSection={<IconUsers style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Member
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="list-role" leftSection={<IconPaperBag style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Role
            </Text>
          </Tabs.Tab>

          <Tabs.Tab value="category-card-access" leftSection={<IconPaperBag style={iconStyle} />}>
            <Text span visibleFrom="sm">
              Role Category Access
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list-member">
          <ListMember />
        </Tabs.Panel>

        <Tabs.Panel value="list-role">
          <ListRole />
        </Tabs.Panel>

        <Tabs.Panel value="category-card-access">
          <ListRoleCategoryAccess />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default UserManagement;
