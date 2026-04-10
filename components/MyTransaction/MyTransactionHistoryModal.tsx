import { LogItemDto } from "@/types/dtos/LogItemDto";
import { StatusLogDto } from "@/types/dtos/TransactionDto";
import { formatDate } from "@/utils";
import { Box, Center, Group, Loader, Modal, Stack, Text, ThemeIcon, Timeline } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCircleCheck, IconClock, IconCreditCard, IconRobot, IconTruckDelivery, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Props {
  opened: boolean;
  onClose: () => void;
  statusLogs: StatusLogDto[] | undefined;
  invoice: string;
  transactionId: string | undefined;
}

export const MyTransactionHistoryModal = ({ opened, onClose, transactionId, invoice }: Props) => {
  const [logs, setLogs] = useState<LogItemDto[]>([]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <IconCircleCheck size={16} />;
      case "SHIPPED":
        return <IconTruckDelivery size={16} />;
      case "CANCELLED":
      case "FAILED":
        return <IconAlertCircle size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getActorInfo = (log: LogItemDto) => {
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

    if (creator === "SYSTEM_WEBHOOK" || creator === "MIDTRANS_WEBHOOK") {
      return { icon: <IconCreditCard size={14} />, name: "Midtrans Payment" };
    }

    if (!creator) {
      return { icon: <IconUser size={14} />, name: "Unknown" };
    }

    return { icon: <IconUser size={14} />, name: "User (Deleted)" };
  };

  return (
    <Modal opened={opened} size={"xl"} onClose={onClose} centered title={<Text fw={700}>Transaction History</Text>} radius="md">
      {loading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Stack gap="lg">
          <Box>
            <Text size="xs" c="dimmed" fw={600}>
              INVOICE NUMBER
            </Text>
            <Text fw={700} size="sm">
              {invoice}
            </Text>
          </Box>

          <Timeline active={0} bulletSize={24} lineWidth={2}>
            {logs?.map((log) => {
              const actor = getActorInfo(log);

              return (
                <Timeline.Item
                  key={log.id}
                  bullet={getStatusIcon(log.status)}
                  title={
                    <Group justify="space-between">
                      <Text fw={600} size="sm">
                        {log.status}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {formatDate(log.createdAt)}
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

            {!logs?.length && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No status history available yet.
              </Text>
            )}
          </Timeline>
        </Stack>
      )}
    </Modal>
  );
};
