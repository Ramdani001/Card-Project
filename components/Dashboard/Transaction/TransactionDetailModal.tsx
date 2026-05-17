"use client";

import { DeliveryMethod, TransactionStatus } from "@/prisma/generated/prisma/enums";
import { TransactionDto } from "@/types/dtos/TransactionDto";
import { formatDate, formatRupiah } from "@/utils";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPrinter, IconReceipt2, IconRefresh, IconTruck, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface CourierOption {
  courier_code: string;
  courier_name: string;
  price: number;
  estimation: string | null;
}

interface TransactionDetailProps {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto;
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
  const [reason, setReason] = useState("");

  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierCode, setSelectedCourierCode] = useState<string | null>(null);
  const [loadingCouriers, setLoadingCouriers] = useState(false);

  const cancelationStatus = ["CANCELLED", "FAILED", "REFUNDED"];
  const isShipping =
    transaction?.deliveryMethod === DeliveryMethod.SHIP && status == TransactionStatus.SHIPPED && transaction.status !== TransactionStatus.SHIPPED;

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
      setReason(transaction.note);
      setSelectedCourierCode(null);
      setCouriers([]);
      fetchNextStatusOptions(transaction.id);

      if (transaction.deliveryMethod === DeliveryMethod.SHIP) {
        fetchCouriers();
      }
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

  const fetchCouriers = async () => {
    const destinationVillageCode = transaction?.transactionShipmentAddress?.[0]?.villageCode;
    if (!destinationVillageCode) {
      notifications.show({ message: "Destination village code not found on this transaction.", color: "orange" });
      return;
    }

    setLoadingCouriers(true);
    setCouriers([]);
    setSelectedCourierCode(null);

    try {
      // Get main shop as origin
      const shopRes = await fetch(`/api/shops?isMainShop=true`);
      const shopJson = await shopRes.json();

      if (!shopJson.success || !shopJson.data?.[0]) {
        notifications.show({ message: "Main shop not found.", color: "red" });
        return;
      }

      const mainShop = shopJson.data[0];
      if (!mainShop.villageCode || mainShop.villageCode === "undefined") {
        notifications.show({ message: "Main shop has no village code configured.", color: "red" });
        return;
      }

      const totalWeight =
        transaction.items?.reduce((acc: number, item: any) => acc + (item.card?.weight || item.weight || 0) * item.quantity, 0) || 1;

      const res = await fetch(`/api/shipping-cost?origin=${mainShop.villageCode}&destination=${destinationVillageCode}&weight=${totalWeight}`);
      const json = await res.json();

      if (json.success && json.data?.couriers) {
        setCouriers(json.data.couriers);
      } else {
        setCouriers([]);
        notifications.show({ message: "No couriers available for this route.", color: "orange" });
      }
    } catch (err) {
      console.error("Error fetching couriers:", err);
      notifications.show({ message: "Failed to fetch courier list.", color: "red" });
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleSelectCourier = (courierCode: string) => {
    const selected = couriers.find((c) => c.courier_code === courierCode);
    if (!selected) return;

    setSelectedCourierCode(courierCode);
    setExpedition(selected.courier_name);
    setShippingCost(selected.price);
  };

  const handleStatusChange = (value: string | null) => {
    setStatus(value);
  };

  const handleUpdateStatus = async () => {
    if (!status) return;
    if (status === "SHIPPED" && !resi) {
      notifications.show({ message: "Please fill in the Receipt Number for SHIPPED status", color: "orange" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resi, expedition, shippingCost: Number(shippingCost), reason }),
      });

      const json = await res.json();
      if (json.success) {
        notifications.show({
          title: "Updated",
          message: "Transaction updated successfully",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
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
          <IconReceipt2 size={20} />
          <Text fw={600}>Transaction Details</Text>
        </Group>
      }
      size="xl"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {/* ── Printable Invoice ── */}
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
            <Stack gap="md">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={6}>
                  Billed To
                </Text>
                <Stack gap={4}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Name
                    </Text>
                    <Text size="xs" fw={500}>
                      {transaction.user?.name || "-"}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Email
                    </Text>
                    <Text size="xs" fw={500}>
                      {transaction.customerEmail || transaction.user?.email}
                    </Text>
                  </Group>
                </Stack>
              </Box>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={6}>
                  {transaction.deliveryMethod === "SHIP" ? "Shipping Address" : "Pickup Location"}
                </Text>
                {transaction.deliveryMethod === "SHIP" ? (
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {transaction.transactionShipmentAddress[0]?.address}, {transaction.transactionShipmentAddress[0]?.villageName},{" "}
                    {transaction.transactionShipmentAddress[0]?.subDistrictName},<br />
                    {transaction.transactionShipmentAddress[0]?.cityName}, {transaction.transactionShipmentAddress[0]?.provinceName},{" "}
                    {transaction.transactionShipmentAddress[0]?.postalCode}
                  </Text>
                ) : (
                  <>
                    <Text size="sm" fw={500}>
                      {transaction.shop?.name || "No Shop Selected"}
                    </Text>
                    {transaction.shop?.address && (
                      <Text size="xs" c="dimmed" mt={2}>
                        {transaction.shop.address}
                      </Text>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={6}>
                Delivery & Payment
              </Text>
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Delivery
                  </Text>
                  <Text size="xs" fw={500}>
                    {transaction.deliveryMethod === DeliveryMethod.PICKUP ? "Pickup" : "Shipping"}
                  </Text>
                </Group>
                {transaction.deliveryMethod === DeliveryMethod.SHIP && (
                  <>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Expedition
                      </Text>
                      <Text size="xs">{expedition || transaction.expedition || "-"}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Resi
                      </Text>
                      <Text size="xs">{resi || transaction.resi || "-"}</Text>
                    </Group>
                  </>
                )}
                <Group justify="space-between" mt={4}>
                  <Text size="xs" c="dimmed">
                    Payment
                  </Text>
                  <Text size="xs" fw={500}>
                    {transaction.paymentMethod || "-"}
                  </Text>
                </Group>
              </Stack>
            </Box>
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
              {formatRupiah(Number(transaction.totalPrice) + (Number(shippingCost) - (Number(transaction.shippingCost) || 0)))}
            </Text>
          </Group>
        </Stack>
      </Paper>

      {isShipping && (
        <Paper p="md" radius="md" withBorder mb="md">
          <Group justify="space-between" align="center" mb="md">
            <Group gap="xs">
              <IconTruck size={18} />
              <Text fw={600} size="sm">
                Shipping & Courier
              </Text>
            </Group>

            <ActionIcon variant="default" size="lg" onClick={fetchCouriers} loading={loadingCouriers}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>

          {loadingCouriers && (
            <Stack align="center" py="md" gap="xs">
              <Loader size="sm" color="dark" type="dots" />
              <Text size="xs" c="dimmed">
                Fetching available couriers...
              </Text>
            </Stack>
          )}

          {!loadingCouriers && couriers.length > 0 && (
            <Stack gap="xs" mb="md">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                Select Courier
              </Text>
              {couriers.map((c) => {
                const isSelected = selectedCourierCode === c.courier_code;
                return (
                  <Box
                    key={c.courier_code}
                    onClick={() => handleSelectCourier(c.courier_code)}
                    p="sm"
                    style={{
                      borderRadius: 10,
                      cursor: "pointer",
                      border: isSelected ? "2px solid black" : "1px solid #e9ecef",
                      background: isSelected ? "#fff" : "#f8f9fa",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Stack gap={2}>
                        <Text fw={600} size="sm">
                          {c.courier_name}
                        </Text>
                        {c.estimation && (
                          <Text size="xs" c="dimmed">
                            Est. {c.estimation}
                          </Text>
                        )}
                      </Stack>
                      <Text fw={700} size="sm" c={isSelected ? "dark" : "dimmed"}>
                        {formatRupiah(c.price)}
                      </Text>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}

          {!loadingCouriers && couriers.length === 0 && (
            <Box p="sm" mb="md" bg="gray.0" style={{ borderRadius: 10, border: "1px dashed #dee2e6", textAlign: "center" }}>
              <Text size="xs" c="dimmed" fs="italic">
                Click &quot;Load Couriers&quot; to fetch available options for this shipment.
              </Text>
            </Box>
          )}

          <Divider mb="md" />

          <Grid>
            <Grid.Col span={4}>
              <TextInput
                label="Resi / Tracking No."
                placeholder="Input resi number"
                value={resi}
                onChange={(e) => setResi(e.currentTarget.value)}
                withAsterisk={status === "SHIPPED"}
                error={status === "SHIPPED" && !resi ? "Required for SHIPPED status" : undefined}
                description="Input after dropping package to courier"
              />
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {cancelationStatus.some((e) => e === status) && (
        <Paper p="md" radius="md" withBorder mb="md">
          <Stack gap="xs">
            <Text fw={600} size="sm">
              Cancellation / Refund Reason
            </Text>
            <Textarea
              placeholder="Provide a reason (e.g. Stock out, Customer requested, etc.)"
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              minRows={3}
              autosize
              description="This note will be recorded in the transaction history."
              withAsterisk
              disabled={
                transaction.status === TransactionStatus.CANCELLED ||
                transaction.status === TransactionStatus.FAILED ||
                transaction.status === TransactionStatus.REFUNDED
              }
            />
          </Stack>
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

          <Group gap="xs">
            <Button variant="default" leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
              Print / PDF
            </Button>
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
              Update
            </Button>
          </Group>
        </Group>
      </Paper>
    </Modal>
  );
};
