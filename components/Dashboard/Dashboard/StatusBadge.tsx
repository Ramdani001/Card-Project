import { Badge } from "@mantine/core";

export const StatusBadge = ({ status }: { status: string }) => {
  let color = "gray";
  if (status === "PAID") color = "blue";
  if (status === "SENT") color = "yellow";
  if (status === "COMPLETED") color = "green";
  if (status === "CANCELLED") color = "red";

  return (
    <Badge color={color} size="sm" variant="light">
      {status}
    </Badge>
  );
};
