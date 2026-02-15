import { Modal, Timeline, Text, Group, ThemeIcon, Loader, Center } from "@mantine/core";
import { IconGitCommit, IconUser, IconRobot, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

interface LogItem {
  id: string;
  status: string;
  note: string;
  createdBy: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface HistoryModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string | null;
  invoice: string;
}

export const TransactionHistoryModal = ({ opened, onClose, transactionId, invoice }: HistoryModalProps) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && transactionId) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, transactionId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/history`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error(error);
      notifications.show({ message: "Gagal mengambil history", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "green";
      case "PENDING":
        return "yellow";
      case "CANCELLED":
        return "red";
      case "SHIPPED":
        return "blue";
      case "COMPLETED":
        return "teal";
      default:
        return "gray";
    }
  };

  const getActorInfo = (log: LogItem) => {
    if (log.user && log.user.name) {
      return {
        icon: <IconUser size={14} />,
        name: log.user.name,
      };
    }

    const creator = log.createdBy;

    if (creator === "SYSTEM") {
      return { icon: <IconRobot size={14} />, name: "System Automation" };
    }

    if (creator === "SYSTEM_WEBHOOK") {
      return { icon: <IconCreditCard size={14} />, name: "Midtrans Payment" };
    }

    if (!creator) {
      return { icon: <IconUser size={14} />, name: "Unknown" };
    }

    return { icon: <IconUser size={14} />, name: "User (Deleted)" };
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`History: ${invoice}`} centered size="lg">
      {loading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Timeline active={0} bulletSize={24} lineWidth={2}>
          {logs.map((log) => {
            const actor = getActorInfo(log);
            return (
              <Timeline.Item
                key={log.id}
                bullet={
                  <ThemeIcon size={22} radius="xl" color={getStatusColor(log.status)}>
                    <IconGitCommit size={12} />
                  </ThemeIcon>
                }
                title={
                  <Group justify="space-between">
                    <Text fw={600} size="sm">
                      {log.status}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Group>
                }
              >
                <Text c="dimmed" size="sm" mt={4}>
                  {log.note || "-"}
                </Text>

                <Group gap={6} mt="xs">
                  <ThemeIcon variant="transparent" c="dimmed" size="xs">
                    {actor.icon}
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    Updated by:{" "}
                    <Text span fw={500}>
                      {actor.name}
                    </Text>
                  </Text>
                </Group>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}

      {!loading && logs.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Tidak ada history tercatat.
        </Text>
      )}
    </Modal>
  );
};
