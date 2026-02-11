"use client";

import { Button, Divider, Flex, Group, Modal, Paper, Select, Table, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { StatusBadge } from "../layout/StatusBadge";

interface TransactionDetailProps {
  opened: boolean;
  onClose: () => void;
  transaction: any;
  onUpdateSuccess: () => void;
}

export const TransactionDetailModal = ({ opened, onClose, transaction, onUpdateSuccess }: TransactionDetailProps) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(transaction?.status || null);

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
        notifications.show({ title: "Updated", message: "Transaction status updated", color: "teal" });
        onUpdateSuccess();
        onClose();
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red" });
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={`Invoice: ${transaction.invoice}`} size="lg" centered>
      <Group justify="space-between" mb="md" align="start">
        <div>
          <Text size="xs" c="dimmed">
            Customer
          </Text>
          <Text fw={500}>{transaction.customerName || transaction.user?.name || "Guest"}</Text>
          <Text size="sm" c="dimmed">
            {transaction.customerEmail || transaction.user?.email}
          </Text>
        </div>
        <div style={{ textAlign: "right" }}>
          <Text size="xs" c="dimmed">
            Total Amount
          </Text>
          <Text fw={700} size="xl" c="blue">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(transaction.totalPrice))}
          </Text>
          <StatusBadge status={transaction.status} />
        </div>
      </Group>

      <Divider my="sm" label="Ordered Items" labelPosition="center" />

      <Paper withBorder p="xs" bg="gray.0" mb="lg">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Total</Table.Th>
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
                <Table.Td>x{item.quantity}</Table.Td>
                <Table.Td>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(item.subTotal))}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Text size="sm" fw={500} mb="xs">
          Update Status
        </Text>
        <Flex gap="sm">
          <Select
            data={["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"]}
            value={status}
            onChange={setStatus}
            placeholder="Select status"
            style={{ flex: 1 }}
          />
          <Button onClick={handleUpdateStatus} loading={loading} disabled={status === transaction.status}>
            Update
          </Button>
        </Flex>
      </Paper>
    </Modal>
  );
};
