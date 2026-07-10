"use client";

import { DeliveryMethod } from "@/prisma/generated/prisma/enums";
import { LogItemDto } from "@/types/dtos/LogItemDto";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import { formatDate, formatRupiah } from "@/utils";
import {
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconMapPin,
  IconPackage,
  IconReceipt2,
  IconRobot,
  IconTruckDelivery,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Props {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto | null;
}

export const MyTransactionDetailModal = ({ opened, onClose, transaction }: Props) => {
  const [logs, setLogs] = useState<LogItemDto[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch history logs ketika modal dibuka
  useEffect(() => {
    if (opened && transaction?.id) {
      fetchLogs(transaction.id);
    }
  }, [opened, transaction?.id]);

  const fetchLogs = async (transactionId: string) => {
    setLoadingLogs(true);
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
      notifications.show({ message: "Gagal mengambil history transaksi", color: "red" });
    } finally {
      setLoadingLogs(false);
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
      return { icon: <IconUser size={14} />, name: log.user.name };
    }
    const creator = log.createdBy;
    if (creator === "SYSTEM") return { icon: <IconRobot size={14} />, name: "System Automation" };
    if (creator === "SYSTEM_WEBHOOK" || creator === "MIDTRANS_WEBHOOK") return { icon: <IconCreditCard size={14} />, name: "Midtrans Payment" };
    if (!creator) return { icon: <IconUser size={14} />, name: "Unknown" };

    return { icon: <IconUser size={14} />, name: "User (Deleted)" };
  };

  if (!transaction) return null;

  const isPickup = transaction.deliveryMethod === DeliveryMethod.PICKUP;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl" // Diperbesar menjadi xl agar muat 2 kolom
      radius="md"
      title={
        <Text fw={700} size="lg">
          Order Information
        </Text>
      }
    >
      <Grid>
        {/* KOLOM KIRI: DETAIL TRANSAKSI */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg" pr={{ base: 0, md: "md" }} style={{ borderRight: "1px dashed #e9ecef" }}>
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed" fw={600}>
                  INVOICE
                </Text>
                <Text fw={700} size="lg">
                  {transaction.invoice}
                </Text>
              </Box>

              <Stack gap={2} align="flex-end">
                <Badge color={isPickup ? "grape" : "blue"} variant="light" size="lg">
                  {isPickup ? DeliveryMethod.PICKUP : DeliveryMethod.SHIP}
                </Badge>
                <Text size="xs" c="dimmed">
                  {transaction.paymentMethod || "Payment method not selected"}
                </Text>
              </Stack>
            </Group>

            <Divider />

            <Stack gap={6}>
              <Group gap={6}>
                {isPickup ? <IconMapPin size={18} /> : <IconTruckDelivery size={18} />}
                <Text size="sm" fw={700}>
                  {isPickup ? "Pickup Location" : "Shipping Address"}
                </Text>
              </Group>

              <Paper withBorder p="sm" radius="md" bg="gray.0">
                {isPickup ? (
                  <>
                    <Text fw={600}>{transaction.shop?.name || "Pickup Shop"}</Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                      {transaction.shop?.address}, {transaction.shop?.villageName}, {transaction.shop?.subDistrictName},
                      <br />
                      {transaction.shop?.cityName}, {transaction.shop?.provinceName}, {transaction.shop?.postalCode}
                    </Text>
                  </>
                ) : (
                  <Stack gap="xs">
                    <Box>
                      <Text fw={600}>{transaction.customerName}</Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {transaction.user?.phone}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {transaction.transactionShipmentAddress[0]?.address}, {transaction.transactionShipmentAddress[0]?.villageName},{" "}
                        {transaction.transactionShipmentAddress[0]?.subDistrictName},
                        <br />
                        {transaction.transactionShipmentAddress[0]?.cityName}, {transaction.transactionShipmentAddress[0]?.provinceName},{" "}
                        {transaction.transactionShipmentAddress[0]?.postalCode}
                      </Text>
                    </Box>

                    <Group gap="xl" pt="xs" style={{ borderTop: "1px dashed #ced4da" }}>
                      <Box>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Courier
                        </Text>
                        <Text size="sm" fw={500}>
                          {transaction.expedition || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          Tracking Number
                        </Text>
                        <Text size="sm" fw={500}>
                          {transaction.resi || "-"}
                        </Text>
                      </Box>
                    </Group>
                  </Stack>
                )}
              </Paper>
            </Stack>

            <Stack gap={6}>
              <Group gap={6}>
                <IconPackage size={18} />
                <Text size="sm" fw={700}>
                  Purchased Products
                </Text>
              </Group>

              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                <ScrollArea>
                  <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th>Product</Table.Th>
                        <Table.Th ta="center">Qty</Table.Th>
                        <Table.Th ta="right">Price</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {transaction.items.map((item, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>
                            <Text fw={600} size="sm">
                              {item.productName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.skuSnapshot || "-"}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="center">{item.quantity}x</Table.Td>
                          <Table.Td ta="right">{formatRupiah(Number(item.productPrice))}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>

            <Stack gap={6}>
              <Group gap={6}>
                <IconReceipt2 size={18} />
                <Text size="sm" fw={700}>
                  Payment Summary
                </Text>
              </Group>

              <Stack gap={6} mt="xs">
                <Flex justify="space-between">
                  <Text size="sm" c="dimmed">
                    Subtotal
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatRupiah(Number(transaction.subTotal))}
                  </Text>
                </Flex>

                {!isPickup && (
                  <Flex justify="space-between">
                    <Text size="sm" c="dimmed">
                      Shipping Cost
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatRupiah(Number(transaction.shippingCost))}
                    </Text>
                  </Flex>
                )}

                {Number(transaction.voucherAmount) > 0 && (
                  <Flex justify="space-between">
                    <Text size="sm" c="green" fw={600}>
                      Product Discount
                    </Text>
                    <Text size="sm" c="green" fw={600}>
                      -{formatRupiah(Number(transaction.voucherAmount))}
                    </Text>
                  </Flex>
                )}

                {Number(transaction.shippingVoucherAmount) > 0 && (
                  <Flex justify="space-between">
                    <Text size="sm" c="blue" fw={600}>
                      Shipping Discount
                    </Text>
                    <Text size="sm" c="blue" fw={600}>
                      -{formatRupiah(Number(transaction.shippingVoucherAmount))}
                    </Text>
                  </Flex>
                )}

                <Divider my="sm" variant="dashed" />

                <Flex justify="space-between" align="center">
                  <Text fw={800} size="md">
                    Total Paid
                  </Text>
                  <Text fw={900} size="xl" c="dark">
                    {formatRupiah(Number(transaction.totalPrice))}
                  </Text>
                </Flex>
              </Stack>
            </Stack>
          </Stack>
        </Grid.Col>
        {/* KOLOM KANAN: HISTORY TIMELINE (Dapat di-scroll secara independen) */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack h="100%">
            <Group gap={8}>
              <IconClock size={18} />
              <Text size="sm" fw={700}>
                Tracking History
              </Text>
            </Group>

            {/* ScrollArea yang membatasi tinggi agar timeline bisa discroll */}
            <ScrollArea h={550} offsetScrollbars type="auto">
              {loadingLogs ? (
                <Center h={300}>
                  <Loader color="dark" type="dots" />
                </Center>
              ) : (
                <Timeline active={0} bulletSize={24} lineWidth={2} mt="xs" pr="md">
                  {logs?.map((log) => {
                    const actor = getActorInfo(log);

                    return (
                      <Timeline.Item
                        key={log.id}
                        bullet={getStatusIcon(log.status)}
                        title={
                          <Group justify="space-between" wrap="nowrap" align="flex-start">
                            <Text fw={600} size="sm">
                              {log.status}
                            </Text>
                            <Text c="dimmed" size="xs" ta="right">
                              {formatDate(log.createdAt)}
                            </Text>
                          </Group>
                        }
                      >
                        <Text c="dimmed" size="xs" mt={4} style={{ lineHeight: 1.4 }}>
                          {log.note || "-"}
                        </Text>

                        <Group gap={6} mt="xs">
                          <ThemeIcon variant="transparent" c="dimmed" size="xs">
                            {actor.icon}
                          </ThemeIcon>
                          <Text size="xs" c="dimmed">
                            by:{" "}
                            <Text span fw={600}>
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
              )}
            </ScrollArea>
          </Stack>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};
