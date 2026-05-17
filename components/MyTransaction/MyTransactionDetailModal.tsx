import { DeliveryMethod } from "@/prisma/generated/prisma/enums";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import { formatRupiah } from "@/utils";
import { Badge, Box, Divider, Flex, Group, Modal, Paper, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconMapPin, IconPackage, IconReceipt2, IconTruckDelivery } from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto | null;
}

export const MyTransactionDetailModal = ({ opened, onClose, transaction }: Props) => {
  if (!transaction) return null;

  const isPickup = transaction.deliveryMethod === DeliveryMethod.PICKUP;

  return (
    <Modal opened={opened} onClose={onClose} centered size="lg" radius="md" title={<Text fw={700}>Transaction Details</Text>}>
      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Text size="xs" c="dimmed" fw={600}>
              INVOICE
            </Text>
            <Text fw={700}>{transaction.invoice}</Text>
          </Box>

          <Stack gap={2} align="flex-end">
            <Badge color={isPickup ? "grape" : "blue"} variant="light">
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
            {isPickup ? <IconMapPin size={16} /> : <IconTruckDelivery size={16} />}
            <Text size="sm" fw={700}>
              {isPickup ? "Pickup Location" : "Shipping Address"}
            </Text>
          </Group>

          <Paper withBorder p="sm" radius="md" bg="gray.0">
            {isPickup ? (
              <>
                <Text fw={600}>{transaction.shop?.name || "Pickup Shop"}</Text>
                <Text size="xs" c="dimmed">
                  {transaction.shop?.address || "No shop address"}
                </Text>
              </>
            ) : (
              <Stack gap="xs">
                <Box>
                  <Text fw={600}>{transaction.customerName}</Text>
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {transaction.transactionShipmentAddress[0]?.address}, {transaction.transactionShipmentAddress[0]?.villageName},{" "}
                    {transaction.transactionShipmentAddress[0]?.subDistrictName},
                    <br />
                    {transaction.transactionShipmentAddress[0]?.cityName}, {transaction.transactionShipmentAddress[0]?.provinceName},{" "}
                    {transaction.transactionShipmentAddress[0]?.postalCode}
                  </Text>
                </Box>

                <Group gap="xl" pt="xs" style={{ borderTop: "1px dashed #e9ecef" }}>
                  <Box>
                    <Text size="sm" fw={600}>
                      Courier
                    </Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                      {transaction.expedition || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={600}>
                      Tracking Number
                    </Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
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
            <IconPackage size={16} />
            <Text size="sm" fw={700}>
              Purchased Products
            </Text>
          </Group>

          <ScrollArea>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
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
        </Stack>

        <Divider />

        <Stack gap={6}>
          <Group gap={6}>
            <IconReceipt2 size={16} />
            <Text size="sm" fw={700}>
              Payment Summary
            </Text>
          </Group>

          <Stack gap={4}>
            <Flex justify="space-between">
              <Text size="sm" c="dimmed">
                Subtotal
              </Text>
              <Text size="sm">{formatRupiah(Number(transaction.subTotal))}</Text>
            </Flex>

            {!isPickup && (
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Shipping Cost
                </Text>
                <Text size="sm">{formatRupiah(Number(transaction.shippingCost))}</Text>
              </Flex>
            )}

            {Number(transaction.voucherAmount) > 0 && (
              <Flex justify="space-between">
                <Text size="sm" c="green" fw={600}>
                  Voucher
                </Text>
                <Text size="sm" c="green" fw={600}>
                  -{formatRupiah(Number(transaction.voucherAmount))}
                </Text>
              </Flex>
            )}

            <Divider />

            <Flex justify="space-between">
              <Text fw={800}>Total</Text>
              <Text fw={800} size="lg">
                {formatRupiah(Number(transaction.totalPrice))}
              </Text>
            </Flex>
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};
