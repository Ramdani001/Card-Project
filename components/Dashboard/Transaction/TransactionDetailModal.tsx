"use client";

import { ALLOWED_NEXT_STATUS } from "@/constants";
import { formatDate, formatRupiah } from "@/utils";
import {
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPrinter, IconReceipt2, IconTruck, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface TransactionDetailProps {
  opened: boolean;
  onClose: () => void;
  transaction: any;
  onUpdateSuccess: () => void;
}

export const TransactionDetailModal = ({ opened, onClose, transaction, onUpdateSuccess }: TransactionDetailProps) => {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<string | null>(transaction?.status || null);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [resi, setResi] = useState("");
  const [expedition, setExpedition] = useState("");
  const [shippingCost, setShippingCost] = useState<number | string>(0);

  const contentRef = useRef<HTMLDivElement>(null);

  const isDirty =
    status !== transaction?.status ||
    resi !== (transaction?.resi || "") ||
    expedition !== (transaction?.expedition || "") ||
    Number(shippingCost) !== Number(transaction?.shippingCost || 0);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Invoice-${transaction?.invoice}`,
    onAfterPrint: () => notifications.show({ title: "Printed", message: "Invoice document prepared", color: "blue" }),
  });

  useEffect(() => {
    if (opened && transaction) {
      setStatus(transaction.status);

      setResi(transaction.resi || "");
      setExpedition(transaction.expedition || "");
      setShippingCost(transaction.shippingCost || 0);

      fetchNextStatusOptions(transaction.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, transaction]);

  const fetchNextStatusOptions = async (trxId: string) => {
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/transactions/${trxId}/next-status`);
      const json = await res.json();
      if (json.success) {
        setStatusOptions(json.data);
      } else {
        setStatusOptions([transaction.status]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleStatusChange = (value: string | null) => {
    setStatus(value);

    const shippingStatuses = ["SHIPPED", ...ALLOWED_NEXT_STATUS.SHIPPED];

    if (value && shippingStatuses.includes(value)) {
      setResi(transaction.resi || "");
      setExpedition(transaction.expedition || "");
      setShippingCost(transaction.shippingCost || 0);
    } else {
      setResi("");
      setExpedition("");
      setShippingCost(0);
    }
  };

  const handleUpdateStatus = async () => {
    if (!status) return;

    if (status === "SHIPPED" && !resi) {
      notifications.show({ message: "Harap isi Nomor Resi untuk status SHIPPED", color: "orange" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resi,
          expedition,
          shippingCost: Number(shippingCost),
        }),
      });

      const json = await res.json();
      if (json.success) {
        notifications.show({ title: "Updated", message: "Transaction updated successfully", color: "teal", icon: <IconCheck size={16} /> });
        onUpdateSuccess();
        onClose();
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

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
      default:
        return "gray";
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconReceipt2 size={20} /> <Text fw={600}>Transaction Details</Text>
        </Group>
      }
      size="xl"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Paper ref={contentRef} p="xl" withBorder mb="md" style={{ overflow: "hidden" }}>
        <Group justify="space-between" align="start" mb="xl">
          <div>
            <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="xs">
              <IconReceipt2 style={{ width: "70%", height: "70%" }} />
            </ThemeIcon>
            <Text fw={700} size="lg" c="dark">
              INVOICE
            </Text>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {transaction.invoice}
            </Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge size="lg" color={getStatusColor(transaction.status)} variant="light">
              {transaction.status}
            </Badge>
            <Text size="xs" c="dimmed" mt="xs">
              {formatDate(transaction.createdAt || new Date().toISOString())}
            </Text>
          </div>
        </Group>

        <Divider mb="xl" />

        <Grid mb="xl">
          <Grid.Col span={6}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={5}>
              Billed To
            </Text>
            <Text fw={600}>{transaction.user?.name || "Guest"}</Text>
            <Text size="sm" c="dimmed">
              {transaction.customerEmail || transaction.user?.email}
            </Text>
            <Text size="sm" c="dimmed">
              {transaction.address || "No Address Provided"}
            </Text>
          </Grid.Col>
          <Grid.Col span={6} style={{ textAlign: "right" }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={5}>
              Delivery & Payment
            </Text>
            <Text size="sm">
              <Text span c="dimmed">
                Expedition:
              </Text>{" "}
              {expedition || transaction.expedition || "-"}
            </Text>
            <Text size="sm">
              <Text span c="dimmed">
                Resi:
              </Text>{" "}
              {resi || transaction.resi || "-"}
            </Text>
            <Text size="sm" mt={4}>
              <Text span c="dimmed">
                Payment:
              </Text>{" "}
              {transaction.paymentMethod || "Midtrans"}
            </Text>
          </Grid.Col>
        </Grid>

        <Table withTableBorder withColumnBorders mb="xl">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item Description</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Qty</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Price</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Total</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transaction.items?.map((item: any) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {item.productName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.skuSnapshot}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>{item.quantity}</Table.Td>
                <Table.Td style={{ textAlign: "right" }}>{formatRupiah(Number(item.productPrice || item.subTotal / item.quantity))}</Table.Td>
                <Table.Td style={{ textAlign: "right" }} fw={500}>
                  {formatRupiah(Number(item.subTotal))}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Stack gap="xs" align="flex-end" pr="xs">
          <Group w={250} justify="space-between">
            <Text size="sm" c="dimmed">
              Subtotal
            </Text>
            <Text size="sm" fw={500}>
              {formatRupiah(Number(transaction.subTotal))}
            </Text>
          </Group>

          {Number(shippingCost) > 0 && (
            <Group w={250} justify="space-between">
              <Text size="sm" c="dimmed">
                Shipping Cost
              </Text>
              <Text size="sm" fw={500}>
                {formatRupiah(Number(shippingCost))}
              </Text>
            </Group>
          )}

          {Number(transaction.voucherAmount) > 0 && (
            <Group w={250} justify="space-between">
              <Text size="sm" c="red">
                Discount
              </Text>
              <Text size="sm" c="red">
                - {formatRupiah(Number(transaction.voucherAmount))}
              </Text>
            </Group>
          )}

          <Divider w={250} my={5} />

          <Group w={250} justify="space-between">
            <Text size="lg" fw={700}>
              Total
            </Text>
            <Text size="lg" fw={700} c="blue">
              {formatRupiah(Number(transaction.totalPrice) + (Number(shippingCost) - (transaction.shippingCost || 0)))}
            </Text>
          </Group>
        </Stack>
      </Paper>

      {status === "SHIPPED" && (
        <Paper p="md" radius="md" withBorder mb="md">
          <Group gap="xs" mb="sm">
            <IconTruck size={18} />
            <Text fw={600} size="sm">
              Shipping Information
            </Text>
          </Group>
          <Grid>
            <Grid.Col span={4}>
              <TextInput
                label="Expedition Name"
                placeholder="e.g. JNE, J&T"
                value={expedition}
                disabled={status !== "SHIPPED"}
                onChange={(e) => setExpedition(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Receipt Number (Resi)"
                placeholder="Input Resi"
                value={resi}
                onChange={(e) => setResi(e.currentTarget.value)}
                disabled={status !== "SHIPPED"}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput label="Shipping Cost (Ongkir)" value={shippingCost} disabled={status !== "SHIPPED"} onChange={setShippingCost} min={0} />
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={2}>
            <Text size="sm" fw={600}>
              Management Actions
            </Text>
            <Text size="xs" c="dimmed">
              Update status or print invoice
            </Text>
          </Stack>

          <Group>
            <Button variant="default" leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
              Print / PDF
            </Button>

            <Group gap="xs">
              <Select
                onChange={handleStatusChange}
                data={statusOptions}
                value={status}
                placeholder="Select next status"
                style={{ width: 200 }}
                disabled={loadingOptions || statusOptions.length <= 1}
                rightSection={loadingOptions ? <Loader size={16} /> : null}
              />
              <Button onClick={handleUpdateStatus} loading={loading} disabled={!isDirty}>
                Update Status
              </Button>
            </Group>
          </Group>
        </Group>
      </Paper>
    </Modal>
  );
};
