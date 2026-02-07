"use client";

import { Table, ScrollArea, TextInput, Pagination, Group, Text, Select, Paper, ActionIcon, Center, Loader, CloseButton } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconSearch, IconArrowsSort } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "@mantine/hooks";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  width?: number | string;
}

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  metadata: MetaData;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
  loading?: boolean;

  filterValues?: Record<string, string>;

  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (key: string, order: "asc" | "desc") => void;
  onFilterChange?: (key: string, value: string) => void;
}

const ColumnFilter = ({ initialValue, onChange }: { initialValue: string; onChange: (val: string) => void }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleDebouncedChange = useDebouncedCallback((val: string) => {
    onChange(val);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setValue(val);
    handleDebouncedChange(val);
  };

  return (
    <TextInput
      placeholder="Filter..."
      size="xs"
      variant="filled"
      leftSection={<IconSearch size={12} />}
      rightSection={
        value ? (
          <CloseButton
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue("");
              onChange("");
            }}
          />
        ) : null
      }
      value={value}
      onChange={handleChange}
      styles={{ input: { height: 24, minHeight: 24, fontSize: 12 } }}
    />
  );
};

export function TableComponent<T extends { id?: number | string; [key: string]: any }>({
  data,
  columns,
  metadata,
  sortBy,
  sortOrder,
  loading = false,
  filterValues = {},
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
}: TableProps<T>) {
  const handleSortClick = (key: string) => {
    if (sortBy === key) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      onSortChange(key, newOrder);
    } else {
      onSortChange(key, "asc");
    }
  };

  const renderSortIcon = (colKey: string) => {
    if (sortBy !== colKey) {
      return <IconArrowsSort size={14} style={{ opacity: 0.3 }} />;
    }
    return sortOrder === "asc" ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
  };

  return (
    <Paper shadow="xs" radius="md" p="md" withBorder>
      <ScrollArea>
        <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={String(col.key)} style={{ width: col.width }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={600} size="sm">
                        {col.label}
                      </Text>
                      {col.sortable && (
                        <ActionIcon
                          variant="subtle"
                          size="xs"
                          color={sortBy === String(col.key) ? "blue" : "gray"}
                          onClick={() => handleSortClick(String(col.key))}
                        >
                          {renderSortIcon(String(col.key))}
                        </ActionIcon>
                      )}
                    </Group>

                    {col.filterable && onFilterChange && (
                      <ColumnFilter initialValue={filterValues[String(col.key)] || ""} onChange={(val) => onFilterChange(String(col.key), val)} />
                    )}
                  </div>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center p="xl">
                    <Loader size="sm" />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <Table.Tr key={item.id || index}>
                  {columns.map((col) => (
                    <Table.Td key={String(col.key)}>
                      {col.render ? col.render(item, index) : String(item[col.key] !== null && item[col.key] !== undefined ? item[col.key] : "-")}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center p="xl">
                    <Text c="dimmed">No data found</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="md">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Rows per page:
          </Text>
          <Select
            value={metadata.limit.toString()}
            onChange={(val) => val && onLimitChange(Number(val))}
            data={["5", "10", "20", "50"]}
            size="xs"
            w={70}
            allowDeselect={false}
          />
          <Text size="sm" c="dimmed">
            Showing {(metadata.page - 1) * metadata.limit + 1} - {Math.min(metadata.page * metadata.limit, metadata.total)} of {metadata.total}{" "}
            entries
          </Text>
        </Group>

        <Pagination total={metadata.totalPages} value={metadata.page} onChange={onPageChange} color="blue" size="sm" disabled={loading} />
      </Group>
    </Paper>
  );
}
