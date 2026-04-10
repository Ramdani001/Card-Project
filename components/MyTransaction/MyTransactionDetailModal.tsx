import { TransactionDto } from "@/types/dtos/TransactionDto";
import { formatRupiah } from "@/utils";
import { Box, Divider, Flex, Group, Modal, Paper, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconMapPin, IconPackage, IconReceipt2 } from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto | null;
}

export const MyTransactionDetailModal = ({ opened, onClose, transaction }: Props) => {
  if (!transaction) return null;

  return (
    <Modal opened={opened} onClose={onClose} centered title={<Text fw={700}>Transaction Details</Text>} size="lg" radius="md">
      <Stack gap="md">
        {/* Header Info */}
        <Group justify="space-between">
          <Box>
            <Text size="xs" c="dimmed" fw={600}>
              INVOICE
            </Text>
            <Text fw={700}>{transaction.invoice}</Text>
          </Box>
          <Box style={{ textAlign: "right" }}>
            <Text size="xs" c="dimmed" fw={600}>
              PAYMENT METHOD
            </Text>
            <Text fw={700} c="blue">
              {transaction.paymentMethod || "-"}
            </Text>
          </Box>
        </Group>

        <Divider variant="dashed" />

        {/* Shipping Address */}
        <Stack gap={4}>
          <Group gap={8}>
            <IconMapPin size={16} color="gray" />
            <Text size="sm" fw={700}>
              Shipping Address
            </Text>
          </Group>
          <Paper withBorder p="xs" bg="gray.0" radius="sm">
            <Text size="sm" fw={600}>
              {transaction.customerName}
            </Text>
            <Text size="xs" c="dimmed">
              {transaction.address || "No address provided"}
            </Text>
          </Paper>
        </Stack>

        {/* Product List */}
        <Stack gap={4}>
          <Group gap={8}>
            <IconPackage size={16} color="gray" />
            <Text size="sm" fw={700}>
              Purchased Products
            </Text>
          </Group>
          <ScrollArea>
            <Table variant="simple" verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Text size="xs" c="dimmed">
                      PRODUCT
                    </Text>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">
                      QTY
                    </Text>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>
                    <Text size="xs" c="dimmed">
                      PRICE
                    </Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transaction.items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {item.productName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        SKU: {item.skuSnapshot}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Text size="sm">{item.quantity}x</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" fw={600}>
                        {formatRupiah(Number(item.productPrice))}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>

        <Divider variant="dashed" />

        {/* Payment Summary */}
        <Stack gap="xs">
          <Group gap={8}>
            <IconReceipt2 size={16} color="gray" />
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
            <Flex justify="space-between">
              <Text size="sm" c="dimmed">
                Shipping Cost
              </Text>
              <Text size="sm">{formatRupiah(Number(transaction.shippingCost))}</Text>
            </Flex>
            {Number(transaction.voucherAmount) > 0 && (
              <Flex justify="space-between">
                <Text size="sm" c="green" fw={600}>
                  Voucher Discount
                </Text>
                <Text size="sm" c="green" fw={600}>
                  -{formatRupiah(Number(transaction.voucherAmount))}
                </Text>
              </Flex>
            )}
            <Flex justify="space-between" mt="xs">
              <Text fw={800}>Total Amount</Text>
              <Text fw={800} c="blue" size="lg">
                {formatRupiah(Number(transaction.totalPrice))}
              </Text>
            </Flex>
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};
