import { Badge } from "@mantine/core";

export const StatusBadge = ({ status }: { status: string }) => {
  let color = "gray";

  switch (status) {
    case "PENDING":
      color = "yellow";
      break;
    case "PAID":
      color = "cyan";
      break;
    case "PROCESSED":
      color = "blue";
      break;
    case "SHIPPED":
      color = "indigo";
      break;
    case "COMPLETED":
      color = "teal";
      break;
    case "CANCELLED":
      color = "red";
      break;
    case "FAILED":
      color = "red";
      break;
    case "REFUNDED":
      color = "orange";
      break;
  }

  return (
    <Badge color={color} variant="light">
      {status}
    </Badge>
  );
};
