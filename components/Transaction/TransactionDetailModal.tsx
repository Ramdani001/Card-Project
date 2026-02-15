"use client";

import { Badge, Button, Divider, Grid, Group, Modal, Paper, ScrollArea, Select, Stack, Table, Text, ThemeIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPrinter, IconReceipt2, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
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

  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Invoice-${transaction?.invoice}`,
    onAfterPrint: () => notifications.show({ title: "Printed", message: "Invoice document prepared", color: "blue" }),
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateStatus = async () => {
    if (!status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (json.success) {
        notifications.show({ title: "Updated", message: "Transaction status updated", color: "teal", icon: <IconCheck size={16} /> });
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
            <Text fw={600}>{transaction.customerName || transaction.user?.name || "Guest"}</Text>
            <Text size="sm" c="dimmed">
              {transaction.customerEmail || transaction.user?.email}
            </Text>
            <Text size="sm" c="dimmed">
              {transaction.address || "No Address Provided"}
            </Text>
          </Grid.Col>
          <Grid.Col span={6} style={{ textAlign: "right" }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={5}>
              Payment Details
            </Text>
            <Text size="sm">
              <Text span c="dimmed">
                Method:
              </Text>{" "}
              {transaction.paymentMethod || "Midtrans"}
            </Text>
            <Text size="sm">
              <Text span c="dimmed">
                Date:
              </Text>{" "}
              {new Date(transaction.updatedAt).toLocaleDateString("id-ID")}
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

          {Number(transaction.voucherAmount) > 0 && (
            <Group w={250} justify="space-between">
              <Text size="sm" c="red">
                Discount (Voucher)
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
              {formatRupiah(Number(transaction.totalPrice))}
            </Text>
          </Group>
        </Stack>

        <Text size="xs" c="dimmed" mt={50} ta="center">
          Thank you for your business. This is a computer-generated invoice.
        </Text>
      </Paper>

      <Paper p="md" radius="md">
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
                data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
                value={status}
                onChange={setStatus}
                placeholder="Status"
                w={140}
                allowDeselect={false}
              />
              <Button onClick={handleUpdateStatus} loading={loading} disabled={status === transaction.status}>
                Update
              </Button>
            </Group>
          </Group>
        </Group>
      </Paper>
    </Modal>
  );
};
