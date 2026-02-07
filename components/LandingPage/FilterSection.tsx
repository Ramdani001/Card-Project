import { Checkbox, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";

interface FilterSectionProps {
  selectedTypes: string[];
  setSelectedTypes: Dispatch<SetStateAction<string[]>>;
  availableTypes: string[];
}

export const FilterSection = ({ selectedTypes, setSelectedTypes, availableTypes }: FilterSectionProps) => {
  return (
    <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
      <Group justify="space-between" mb="md">
        <Title order={6} tt="uppercase" style={{ letterSpacing: 0.5 }}>
          Filter Products
        </Title>
        {selectedTypes.length > 0 && (
          <Text size="xs" c="red" style={{ cursor: "pointer" }} onClick={() => setSelectedTypes([])}>
            Clear All
          </Text>
        )}
      </Group>

      <Stack gap="xs">
        <Text size="sm" fw={700} mb={4}>
          Product Type
        </Text>
        {availableTypes.length > 0 ? (
          availableTypes.map((type) => (
            <Checkbox
              key={type}
              label={type}
              checked={selectedTypes.includes(type)}
              onChange={() => {
                setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
              }}
              styles={{ label: { fontSize: 14, color: "#495057", cursor: "pointer" }, input: { cursor: "pointer" } }}
            />
          ))
        ) : (
          <Text size="xs" c="dimmed">
            No filters available
          </Text>
        )}
      </Stack>

      <Divider my="md" />

      <Stack gap="xs">
        <Text size="sm" fw={700} mb={4}>
          Availability
        </Text>
        <Checkbox label="In Stock" styles={{ label: { fontSize: 14, color: "#495057" } }} />
        <Checkbox label="Out of Stock" styles={{ label: { fontSize: 14, color: "#495057" } }} />
      </Stack>
    </Paper>
  );
};
