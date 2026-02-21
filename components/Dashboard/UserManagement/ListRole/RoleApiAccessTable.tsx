import { ApiPermissionStateDto } from "@/types/dtos/RoleDto";
import { ActionIcon, Checkbox, Table, Text, ScrollArea, Box } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface Props {
  value: ApiPermissionStateDto[];
  onChange: (val: ApiPermissionStateDto[]) => void;
  onRemove: (url: string) => void;
}

export const RoleApiAccessTable = ({ value, onChange, onRemove }: Props) => {
  const handleToggle = (url: string, field: keyof Omit<ApiPermissionStateDto, "url" | "description">) => {
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
    <Box mt="md">
      <ScrollArea h={300} scrollbarSize={10}>
        <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader stickyHeaderOffset={0}>
          <Table.Thead bg="var(--mantine-color-body)">
            <Table.Tr>
              <Table.Th>API Endpoint</Table.Th>
              <Table.Th style={{ width: 100, textAlign: "center" }}>Read</Table.Th>
              <Table.Th style={{ width: 100, textAlign: "center" }}>Create</Table.Th>
              <Table.Th style={{ width: 100, textAlign: "center" }}>Update</Table.Th>
              <Table.Th style={{ width: 100, textAlign: "center" }}>Delete</Table.Th>
              <Table.Th style={{ width: 80, textAlign: "center" }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {value.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  <Text c="dimmed" py="xl" size="sm">
                    Belum ada akses API yang ditambahkan.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              value.map((item) => (
                <Table.Tr key={item.url}>
                  <Table.Td>
                    <Text fw={600} size="sm" style={{ whiteSpace: "nowrap" }}>
                      {item.url}
                    </Text>
                    {item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td align="center">
                    <Checkbox checked={item.canRead} onChange={() => handleToggle(item.url, "canRead")} />
                  </Table.Td>

                  <Table.Td align="center">
                    <Checkbox color="green" checked={item.canCreate} onChange={() => handleToggle(item.url, "canCreate")} />
                  </Table.Td>

                  <Table.Td align="center">
                    <Checkbox color="orange" checked={item.canUpdate} onChange={() => handleToggle(item.url, "canUpdate")} />
                  </Table.Td>

                  <Table.Td align="center">
                    <Checkbox color="red" checked={item.canDelete} onChange={() => handleToggle(item.url, "canDelete")} />
                  </Table.Td>

                  <Table.Td align="center">
                    <ActionIcon variant="subtle" color="red" onClick={() => onRemove(item.url)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
};
