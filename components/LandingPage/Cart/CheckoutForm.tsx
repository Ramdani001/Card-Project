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
  Text,
  TextInput,
  Textarea,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { IconMapPin, IconTicket, IconTruckDelivery } from "@tabler/icons-react";

interface CheckoutFormProps {
  totalAmount: number;
  voucherCode: string;
  setVoucherCode: (val: string) => void;
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
  totalAmount,
  voucherCode,
  setVoucherCode,
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
}: CheckoutFormProps) => {
  const isShipping = deliveryMethod === DeliveryMethod.SHIP;

  const resetCourierSelection = () => setSelectedCourierCode(null);

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box px="md" pt="md" pb="sm" style={{ flexShrink: 0 }}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" style={{ letterSpacing: "0.06em" }}>
          Order Summary
        </Text>
        <Stack gap={4}>
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
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
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
            <TextInput
              placeholder="Enter voucher code"
              leftSection={<IconTicket size={16} stroke={1.5} />}
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.currentTarget.value)}
              radius="md"
              size="md"
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
        <Button
          fullWidth
          color="dark"
          radius="md"
          size="lg"
          onClick={onCheckout}
          loading={isCheckoutLoading}
          disabled={isCheckoutDisabled}
          style={{ height: rem(54) }}
        >
          CHECKOUT NOW
        </Button>
        <Text ta="center" size="xs" c="dimmed" mt="xs">
          By clicking checkout, you agree to our terms and conditions.
        </Text>
      </Box>
    </Box>
  );
};
