import { Checkbox, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";

export interface FilterCategory {
  id: string;
  name: string;
}

interface FilterSectionProps {
  categories: FilterCategory[];
  selectedCategoryIds: string[];
  selectedFilterStock: string;
  setSelectedCategoryIds: Dispatch<SetStateAction<string[]>>;
  setSelectedFilterStock: Dispatch<SetStateAction<string>>;
}

export const FilterSection = ({
  categories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  setSelectedFilterStock,
  selectedFilterStock,
}: FilterSectionProps) => {
  const handleToggle = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  return (
    <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
      <Group justify="space-between" mb="md">
        <Title order={6} tt="uppercase" style={{ letterSpacing: 0.5 }}>
          Filter Products
        </Title>
        {selectedCategoryIds.length > 0 && (
          <Text size="xs" c="red" style={{ cursor: "pointer" }} onClick={() => setSelectedCategoryIds([])}>
            Clear All
          </Text>
        )}
      </Group>

      <Stack gap="xs">
        <Text size="sm" fw={700} mb={4}>
          Categories
        </Text>

        {categories.length > 0 ? (
          categories.map((cat) => (
            <Checkbox
              key={cat.name}
              label={cat.name}
              checked={selectedCategoryIds.includes(cat.name)}
              onChange={() => handleToggle(cat.name)}
              styles={{
                label: { fontSize: 14, color: "#495057", cursor: "pointer" },
                input: { cursor: "pointer" },
              }}
            />
          ))
        ) : (
          <Text size="xs" c="dimmed">
            No categories available
          </Text>
        )}
      </Stack>

      <Divider my="md" />

      <Stack gap="xs">
        <Text size="sm" fw={700} mb={4}>
          Availability
        </Text>
        <Checkbox
          checked={selectedFilterStock == "on"}
          onChange={() => setSelectedFilterStock("on")}
          label="In Stock"
          styles={{ label: { fontSize: 14, color: "#495057" } }}
        />
        <Checkbox
          checked={selectedFilterStock == "off"}
          onChange={() => setSelectedFilterStock("off")}
          label="Out of Stock"
          styles={{ label: { fontSize: 14, color: "#495057" } }}
        />
      </Stack>
    </Paper>
  );
};
