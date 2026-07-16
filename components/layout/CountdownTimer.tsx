import { useState, useEffect } from "react";
import { Text, Group } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";

export const CountdownTimer = ({ expiryTime }: { expiryTime: string | Date | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!expiryTime) return;

    const calculateTime = () => {
      const now = dayjs();
      const target = dayjs(expiryTime);
      const diff = target.diff(now, "second");

      if (diff <= 0) {
        setTimeLeft("Expired");
      } else {
        const h = Math.floor(diff / 3600).toString().padStart(2, "0");
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
        const s = (diff % 60).toString().padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  if (!expiryTime || !timeLeft) return null;

  if (timeLeft === "Expired") {
    return (
      <Text size="xs" c="red" fw={700}>
        Payment expired
      </Text>
    );
  }

  return (
    <Group gap={6} bg="orange.1" px={10} py={4} style={{ borderRadius: 100 }}>
      <IconClock size={14} color="var(--mantine-color-orange-7)" />
      <Text size="xs" c="orange.8" fw={700}>
        Time left: {timeLeft}
      </Text>
    </Group>
  );
};