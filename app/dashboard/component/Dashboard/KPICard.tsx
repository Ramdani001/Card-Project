import { Paper, Group, ThemeIcon, Text } from "@mantine/core";

export const KPICard = ({ title, value, icon: Icon, color, diff }: { title: string; value: string; icon: any; color: string; diff: string }) => {
  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          <Icon size="1.2rem" stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text fw={700} size="xl" style={{ lineHeight: 1 }}>
          {value}
        </Text>
      </Group>

      <Text c="dimmed" size="xs" mt="sm">
        {diff}
      </Text>
    </Paper>
  );
};
