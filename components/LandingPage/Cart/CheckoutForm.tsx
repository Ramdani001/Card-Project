"use client";

import { DeliveryMethod } from "@/prisma/generated/prisma/enums";
import { Option } from "@/types/dtos/Option";
import { ShopDto } from "@/types/dtos/ShopDto";
import { formatRupiah } from "@/utils";
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
  UnstyledButton,
  rem,
  Modal,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMapPin, IconTicket, IconTruckDelivery, IconReceipt2, IconBuildingStore, IconInfoCircle } from "@tabler/icons-react";

interface CheckoutFormProps {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  voucherCodes: string[];
  onVoucherChange: (val: string[]) => void;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  address: string;
  setAddress: (val: string) => void;
  selectedShop: ShopDto | null;
  setSelectedShop: (val: ShopDto | null) => void;
  listShop: ShopDto[];
  isCheckoutLoading: boolean;
  isCheckoutDisabled: boolean;
  onCheckout: () => void;
  countries: Option[];
  provinces: Option[];
  cities: Option[];
  subDistricts: Option[];
  villages: Option[];
  countryIsoCode: string;
  setCountryIsoCode: (val: string) => void;
  provinceCode: string;
  setProvinceCode: (val: string) => void;
  cityCode: string;
  setCityCode: (val: string) => void;
  subDistrictCode: string;
  setSubDistrictCode: (val: string) => void;
  villageCode: string;
  setVillageCode: (val: string) => void;
  postalCode: string;
  setPostalCode: (val: string) => void;
  couriers: {
    courier_code: string;
    courier_name: string;
    price: number;
    estimation: string | null;
  }[];
  selectedCourierCode: string | null;
  setSelectedCourierCode: (val: string | null) => void;
  shippingFee: number;
}

export const CheckoutForm = ({
  subtotal,
  discountAmount,
  totalAmount,
  voucherCodes,
  deliveryMethod,
  setDeliveryMethod,
  address,
  setAddress,
  selectedShop,
  setSelectedShop,
  listShop,
  isCheckoutLoading,
  isCheckoutDisabled,
  onCheckout,
  countries,
  provinces,
  cities,
  subDistricts,
  villages,
  countryIsoCode,
  setCountryIsoCode,
  provinceCode,
  setProvinceCode,
  cityCode,
  setCityCode,
  subDistrictCode,
  setSubDistrictCode,
  villageCode,
  setVillageCode,
  postalCode,
  setPostalCode,
  couriers,
  selectedCourierCode,
  setSelectedCourierCode,
  shippingFee,
  onVoucherChange,
}: CheckoutFormProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const isShipping = deliveryMethod === DeliveryMethod.SHIP;
  const resetCourierSelection = () => setSelectedCourierCode(null);

  const selectedCourierDetails = couriers.find((c) => c.courier_code === selectedCourierCode);

  const selectedCountryLabel = countries.find((c) => c.value === countryIsoCode)?.label;
  const selectedProvinceLabel = provinces.find((p) => p.value === provinceCode)?.label;
  const selectedCityLabel = cities.find((c) => c.value === cityCode)?.label;
  const selectedSubDistrictLabel = subDistricts.find((s) => s.value === subDistrictCode)?.label;
  const selectedVillageLabel = villages.find((v) => v.value === villageCode)?.label;

  const fullShippingAddress = [
    address,
    selectedVillageLabel,
    selectedSubDistrictLabel,
    selectedCityLabel,
    selectedProvinceLabel,
    selectedCountryLabel,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size="lg"
        title={
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" color="dark" variant="light">
              <IconReceipt2 size={22} />
            </ThemeIcon>
            <Text fw={700} size="xl">
              Review Your Order
            </Text>
          </Group>
        }
        centered
        closeOnClickOutside={!isCheckoutLoading}
        withCloseButton={!isCheckoutLoading}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md" mt="xs">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <IconInfoCircle size={18} color="gray" style={{ marginTop: rem(2) }} />
            <Text size="sm" c="dimmed">
              Please double-check your order details below before proceeding to payment.
            </Text>
          </Group>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                Delivery Details
              </Text>
              <Badge variant="dot" color={isShipping ? "blue" : "teal"}>
                {isShipping ? "Home Delivery" : "Store Pickup"}
              </Badge>
            </Group>

            {isShipping ? (
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" color="blue" size="xl" radius="md">
                  <IconTruckDelivery size={24} />
                </ThemeIcon>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600} size="sm">
                    Shipping Address
                  </Text>

                  {/* Menampilkan alamat lengkap dengan format yang sudah digabung */}
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {fullShippingAddress || "Address details incomplete"}
                  </Text>
                  {postalCode && (
                    <Text size="sm" c="dimmed">
                      Postal Code: {postalCode}
                    </Text>
                  )}

                  {selectedCourierDetails && (
                    <Group gap="xs" mt={8}>
                      <Badge color="gray" variant="light" radius="sm">
                        {selectedCourierDetails.courier_name}
                      </Badge>
                      {selectedCourierDetails.estimation && (
                        <Text size="xs" c="dimmed">
                          Est. {selectedCourierDetails.estimation}
                        </Text>
                      )}
                    </Group>
                  )}
                </Stack>
              </Group>
            ) : (
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" color="teal" size="xl" radius="md">
                  <IconBuildingStore size={24} />
                </ThemeIcon>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600} size="sm">
                    Pickup Location
                  </Text>
                  {selectedShop ? (
                    <>
                      <Text fw={500} size="sm">
                        {selectedShop.name}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                        {selectedShop.address}, {selectedShop.cityName}
                      </Text>
                    </>
                  ) : (
                    <Text size="sm" c="red">
                      No store selected
                    </Text>
                  )}
                </Stack>
              </Group>
            )}
          </Paper>

          {voucherCodes.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                  Applied Promos
                </Text>
              </Group>
              <Group gap="xs">
                {voucherCodes.map((code, idx) => (
                  <Badge key={idx} leftSection={<IconTicket size={12} />} color="green" variant="light" size="lg" radius="sm">
                    {code}
                  </Badge>
                ))}
              </Group>
            </Paper>
          )}

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: "0.05em" }}>
              Payment Summary
            </Text>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Subtotal
                </Text>
                <Text size="sm" fw={500}>
                  {formatRupiah(subtotal)}
                </Text>
              </Group>

              {isShipping && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Shipping Fee
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatRupiah(shippingFee)}
                  </Text>
                </Group>
              )}

              {discountAmount > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="green.7" fw={500}>
                    Discount
                  </Text>
                  <Text size="sm" c="green.7" fw={600}>
                    - {formatRupiah(discountAmount)}
                  </Text>
                </Group>
              )}

              <Divider variant="dashed" />

              <Group justify="space-between" align="center">
                <Text size="md" fw={700}>
                  Total Amount
                </Text>
                <Text size="xl" fw={900} c="dark">
                  {formatRupiah(totalAmount)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close} disabled={isCheckoutLoading} radius="md">
              Back to Edit
            </Button>
            <Button
              color="dark"
              radius="md"
              loading={isCheckoutLoading}
              onClick={() => {
                onCheckout();
              }}
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box px="md" pt="md" pb="sm" style={{ flexShrink: 0 }}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" style={{ letterSpacing: "0.06em" }}>
            Order Summary
          </Text>
          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Subtotal
              </Text>
              <Text size="sm" fw={600}>
                {formatRupiah(subtotal)}
              </Text>
            </Group>

            {shippingFee > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Shipping Fee
                </Text>
                <Text size="sm" fw={600}>
                  {formatRupiah(shippingFee)}
                </Text>
              </Group>
            )}

            {discountAmount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="green.6" fw={600}>
                  Discount
                </Text>
                <Text size="sm" c="green.6" fw={700}>
                  - {formatRupiah(discountAmount)}
                </Text>
              </Group>
            )}

            <Divider my={4} variant="dashed" />

            <Group justify="space-between" align="center">
              <Text size="sm" fw={700} c="dark">
                Total
              </Text>
              <Text fw={900} size="xl" c="dark">
                {formatRupiah(totalAmount)}
              </Text>
            </Group>
          </Stack>
        </Box>

        <Divider />

        <ScrollArea style={{ flex: 1 }} scrollbarSize={6} offsetScrollbars>
          <Stack gap={0}>
            <Box px="md" pt="md" pb="md">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: "0.06em" }}>
                Promo / Voucher
              </Text>

              <TagsInput
                placeholder="Enter voucher codes (press enter)"
                leftSection={<IconTicket size={16} stroke={1.5} />}
                value={voucherCodes}
                radius="md"
                size="md"
                onChange={onVoucherChange}
                splitChars={[",", " "]}
                clearable
              />
            </Box>

            <Divider />

            <Box px="md" pt="md" pb="md">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: "0.06em" }}>
                Delivery Method
              </Text>

              <Group grow gap="xs" mb="md">
                <UnstyledButton
                  onClick={() => {
                    setDeliveryMethod(DeliveryMethod.SHIP);
                    setSelectedShop(null);
                  }}
                  style={{
                    borderRadius: 10,
                    border: isShipping ? "2px solid black" : "1px solid #e9ecef",
                    background: isShipping ? "#fff" : "#f8f9fa",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <Stack gap={4} align="center">
                    <IconTruckDelivery size={20} stroke={1.8} />
                    <Text size="sm" fw={600}>
                      Ship
                    </Text>
                    <Text size="xs" c="dimmed">
                      Delivered to door
                    </Text>
                  </Stack>
                </UnstyledButton>

                <UnstyledButton
                  onClick={() => {
                    setDeliveryMethod(DeliveryMethod.PICKUP);
                    resetCourierSelection();
                  }}
                  style={{
                    borderRadius: 10,
                    border: deliveryMethod === DeliveryMethod.PICKUP ? "2px solid black" : "1px solid #e9ecef",
                    background: deliveryMethod === DeliveryMethod.PICKUP ? "#fff" : "#f8f9fa",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <Stack gap={4} align="center">
                    <IconMapPin size={20} stroke={1.8} />
                    <Text size="sm" fw={600}>
                      Pickup
                    </Text>
                    <Text size="xs" c="dimmed">
                      Pick up at store
                    </Text>
                  </Stack>
                </UnstyledButton>
              </Group>

              {isShipping && (
                <Stack gap="sm">
                  <Textarea
                    placeholder="Street name, house number, apartment, etc."
                    label="Street Address"
                    radius="md"
                    size="sm"
                    value={address}
                    onChange={(e) => setAddress(e.currentTarget.value)}
                    required
                    autosize
                    minRows={2}
                  />

                  <Select
                    label="Country"
                    placeholder="Select country"
                    data={countries}
                    value={countryIsoCode}
                    onChange={(value) => {
                      setCountryIsoCode(value || "");
                      resetCourierSelection();
                    }}
                    searchable
                    size="sm"
                    radius="md"
                  />

                  <Select
                    label="Province"
                    placeholder={countryIsoCode ? "Select province" : "Select country first"}
                    data={provinces}
                    value={provinceCode}
                    onChange={(value) => {
                      setProvinceCode(value || "");
                      resetCourierSelection();
                    }}
                    searchable
                    disabled={!countryIsoCode}
                    size="sm"
                    radius="md"
                  />

                  <SimpleGrid cols={2} spacing="xs">
                    <Select
                      label="City / Regency"
                      placeholder={provinceCode ? "Select city" : "Select province first"}
                      data={cities}
                      value={cityCode}
                      onChange={(value) => {
                        setCityCode(value || "");
                        resetCourierSelection();
                      }}
                      searchable
                      disabled={!provinceCode}
                      size="sm"
                      radius="md"
                    />
                    <Select
                      label="Sub District"
                      placeholder={cityCode ? "Select sub district" : "Select city first"}
                      data={subDistricts}
                      value={subDistrictCode}
                      onChange={(value) => {
                        setSubDistrictCode(value || "");
                        resetCourierSelection();
                      }}
                      searchable
                      disabled={!cityCode}
                      size="sm"
                      radius="md"
                    />
                  </SimpleGrid>

                  <SimpleGrid cols={2} spacing="xs">
                    <Select
                      label="Village"
                      placeholder={subDistrictCode ? "Select village" : "Select sub district first"}
                      data={villages}
                      value={villageCode}
                      onChange={(value) => {
                        setVillageCode(value || "");
                        resetCourierSelection();
                      }}
                      searchable
                      disabled={!subDistrictCode}
                      size="sm"
                      radius="md"
                    />
                    <TextInput
                      label="Postal Code"
                      placeholder="e.g. 12345"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.currentTarget.value)}
                      size="sm"
                      radius="md"
                    />
                  </SimpleGrid>

                  <Box mt="xs">
                    <Group justify="space-between" align="center" mb="xs">
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
                        Courier Service <span style={{ color: "red" }}>*</span>
                      </Text>
                      {selectedCourierCode && (
                        <Badge color="dark" variant="light" size="xs">
                          Selected
                        </Badge>
                      )}
                    </Group>

                    {!villageCode && (
                      <Box p="sm" bg="gray.0" style={{ borderRadius: rem(10), border: "1px dashed #dee2e6", textAlign: "center" }}>
                        <Text size="xs" c="dimmed" fs="italic">
                          Complete your address above to see available couriers.
                        </Text>
                      </Box>
                    )}

                    {villageCode && couriers.length === 0 && (
                      <Box p="sm" bg="gray.0" style={{ borderRadius: rem(10), border: "1px dashed #dee2e6", textAlign: "center" }}>
                        <Text size="xs" c="dimmed" fs="italic">
                          No courier available for this location.
                        </Text>
                      </Box>
                    )}

                    {villageCode && couriers.length > 0 && (
                      <Stack gap="xs">
                        {couriers.map((c) => {
                          const isSelected = selectedCourierCode === c.courier_code;
                          return (
                            <Box
                              key={c.courier_code}
                              onClick={() => setSelectedCourierCode(c.courier_code)}
                              p="sm"
                              style={{
                                borderRadius: 12,
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
                  </Box>
                </Stack>
              )}

              {deliveryMethod === DeliveryMethod.PICKUP && (
                <Stack gap="xs">
                  {listShop.length === 0 && (
                    <Box p="sm" bg="gray.0" style={{ borderRadius: rem(10), border: "1px dashed #dee2e6", textAlign: "center" }}>
                      <Text size="xs" c="dimmed" fs="italic">
                        No store available for pickup.
                      </Text>
                    </Box>
                  )}
                  {listShop.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => setSelectedShop(item)}
                      p="sm"
                      style={{
                        borderRadius: 12,
                        cursor: "pointer",
                        border: selectedShop?.id === item.id ? "2px solid black" : "1px solid #e9ecef",
                        background: selectedShop?.id === item.id ? "#fff" : "#f8f9fa",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text fw={600} size="sm">
                            {item.name}
                          </Text>
                          <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                            {item.address}, {item.villageName}, {item.subDistrictName}, {item.cityName}, {item.provinceName} {item.postalCode}
                          </Text>
                        </Stack>
                        {selectedShop?.id === item.id && (
                          <Badge color="dark" variant="light" size="xs" mt={2}>
                            Selected
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </ScrollArea>

        <Divider />
        <Box px="md" pt="sm" pb="md" style={{ flexShrink: 0 }}>
          <Button id="CO" fullWidth color="dark" radius="md" size="lg" onClick={open} disabled={isCheckoutDisabled} style={{ height: rem(54) }}>
            CHECKOUT NOW
          </Button>
          <Text ta="center" size="xs" c="dimmed" mt="xs">
            By clicking checkout, you agree to our terms and conditions.
          </Text>
        </Box>
      </Box>
    </>
  );
};
