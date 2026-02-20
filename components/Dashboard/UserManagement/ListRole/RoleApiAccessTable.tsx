"use client";

import { ActionIcon, Checkbox, Table, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

export interface ApiPermissionState {
  url: string;
  description?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface Props {
  value: ApiPermissionState[];
  onChange: (val: ApiPermissionState[]) => void;
  onRemove: (url: string) => void;
}

export const RoleApiAccessTable = ({ value, onChange, onRemove }: Props) => {
  const handleToggle = (url: string, field: keyof Omit<ApiPermissionState, "url" | "description">) => {
    const newData = value.map((item) => {
      if (item.url === url) {
        const newVal = !item[field];
        if (newVal === true && field !== "canRead") {
          return { ...item, [field]: newVal, canRead: true };
        }
        return { ...item, [field]: newVal };
      }
      return item;
    });
    onChange(newData);
  };

  return (
    <Table striped highlightOnHover withTableBorder mt="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>API Endpoint</Table.Th>
          <Table.Th>Read</Table.Th>
          <Table.Th>Create</Table.Th>
          <Table.Th>Update</Table.Th>
          <Table.Th>Delete</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {value.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={6} align="center">
              <Text c="dimmed" py="sm" size="sm">
                Belum ada akses API yang ditambahkan.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          value.map((item) => (
            <Table.Tr key={item.url}>
              <Table.Td>
                <Text fw={500} size="sm">
                  {item.url}
                </Text>
                {item.description && (
                  <Text size="xs" c="dimmed">
                    {item.description}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>
                <Checkbox checked={item.canRead} onChange={() => handleToggle(item.url, "canRead")} />
              </Table.Td>
              <Table.Td>
                <Checkbox color="green" checked={item.canCreate} onChange={() => handleToggle(item.url, "canCreate")} />
              </Table.Td>
              <Table.Td>
                <Checkbox color="orange" checked={item.canUpdate} onChange={() => handleToggle(item.url, "canUpdate")} />
              </Table.Td>
              <Table.Td>
                <Checkbox color="red" checked={item.canDelete} onChange={() => handleToggle(item.url, "canDelete")} />
              </Table.Td>
              <Table.Td>
                <ActionIcon variant="subtle" color="red" onClick={() => onRemove(item.url)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
};
