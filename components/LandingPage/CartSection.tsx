"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { ShopDto } from "@/types/dtos/ShopDto";
import { formatRupiah, getCardPrice } from "@/utils";
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
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
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconShoppingCart, IconTicket, IconTruckDelivery } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CartItemRow } from "../Cart/CartItemRow";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";
import { useSession } from "next-auth/react";
import { Option } from "@/types/dtos/Option";

interface CartSectionProps {
  isDrawerOpen: boolean;
  loadingCart: boolean;
  cartItems: CartItemDto[];
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setCartItems: Dispatch<SetStateAction<CartItemDto[]>>;
}

export const CartSection = ({ isDrawerOpen, loadingCart, cartItems, setIsDrawerOpen, setCartItems }: CartSectionProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userAddress = session?.user?.address;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const userId = session?.user?.id;

  const [voucherCode, setVoucherCode] = useState("");
  const [address, setAddress] = useState(userAddress || "");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const totalAmount = cartItems.reduce((acc, item) => acc + getCardPrice(item) * item.quantity, 0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.SHIP);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [listShop, setListShop] = useState<ShopDto[]>([]);

  const [countries, setCountries] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [subDistricts, setSubDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [subDistrictCode, setSubDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/profile/${userId}`);
        const json = await res.json();

        if (json.success) {
          setAddress(json.data.address || "");
          setCountryIsoCode(json.data.countryIsoCode || "");
          setProvinceCode(json.data.provinceCode || "");
          setCityCode(json.data.cityCode || "");
          setSubDistrictCode(json.data.subDistrictCode || "");
          setVillageCode(json.data.villageCode || "");
          setPostalCode(json.data.postalCode || "");
        }
      } catch {
        notifications.show({
          title: "Error",
          message: "Gagal memuat profil",
          color: "red",
        });
      }
    };

    if (status === "authenticated") fetchProfile();
  }, [userId, status]);

  const fetchShops = async () => {
    try {
      const res = await fetch(`/api/shops`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setListShop(json.data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      notifications.show({ title: "Error", message: err.message || "Failed to fetch data", color: "red" });
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/countries");
      const json = await res.json();
      setCountries(json.data.map((item: any) => ({ value: item.isoCode, label: item.name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProvinces = async (countryCode: string) => {
    try {
      const res = await fetch(`/api/provincies?country.isoCode=${countryCode}`);
      const json = await res.json();
      setProvinces(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      const res = await fetch(`/api/cities?province.code=${provinceCode}`);
      const json = await res.json();
      setCities(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubDistricts = async (cityCode: string) => {
    try {
      const res = await fetch(`/api/sub-districts?city.code=${cityCode}`);
      const json = await res.json();
      setSubDistricts(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVillages = async (subDistrictCode: string) => {
    try {
      const res = await fetch(`/api/villages?subDistrict.code=${subDistrictCode}`);
      const json = await res.json();
      setVillages(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);
  useEffect(() => {
    fetchCountries();
  }, []);
  useEffect(() => {
    if (countryIsoCode) fetchProvinces(countryIsoCode);
    else setProvinces([]);
  }, [countryIsoCode]);
  useEffect(() => {
    if (provinceCode) fetchCities(provinceCode);
    else setCities([]);
  }, [provinceCode]);
  useEffect(() => {
    if (cityCode) fetchSubDistricts(cityCode);
    else setSubDistricts([]);
  }, [cityCode]);
  useEffect(() => {
    if (subDistrictCode) fetchVillages(subDistrictCode);
    else setVillages([]);
  }, [subDistrictCode]);

  const handleCheckout = async (voucherCodeFromCart?: string) => {
    const isShipping = deliveryMethod === DeliveryMethod.SHIP;
    const isPickup = deliveryMethod === DeliveryMethod.PICKUP;

    if (isShipping) {
      const isAddressIncomplete = !address.trim() || !provinceCode || !cityCode || !subDistrictCode || !postalCode;

      if (isAddressIncomplete) {
        return notifications.show({
          title: "Incomplete Shipping Info",
          message: "Please ensure all address fields (Province, City, etc.) are filled.",
          color: "red",
          position: "top-left",
        });
      }
    }

    if (isPickup && !selectedShop) {
      return notifications.show({
        title: "No Shop Selected",
        message: "Please select a pickup location before proceeding.",
        color: "red",
        position: "top-left",
      });
    }

    setIsCheckoutLoading(true);

    try {
      const payload = {
        deliveryMethod,
        voucherCode: voucherCodeFromCart || null,
        countryIsoCode: isShipping ? countryIsoCode : null,
        provinceCode: isShipping ? provinceCode : null,
        cityCode: isShipping ? cityCode : null,
        subDistrictCode: isShipping ? subDistrictCode : null,
        villageCode: isShipping ? villageCode : null,
        postalCode: isShipping ? postalCode : null,
        address: isShipping ? address.trim() : null,
        shopId: isPickup ? selectedShop : null,
      };

      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "An unexpected error occurred during checkout.");
      }

      notifications.show({
        title: "Order Placed Successfully!",
        message: "Redirecting you to your transactions...",
        color: "green",
        position: "top-left",
      });

      setIsDrawerOpen(false);
      router.push("/my-transaction");
    } catch (err: any) {
      notifications.show({
        title: "Checkout Failed",
        message: err.message,
        color: "red",
        position: "top-left",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    const previousItem = cartItems.find((item) => item.id === id);
    const oldQty = previousItem?.quantity || 1;

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
    setProcessingId(id);

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      const json = await res.json();
      if (!json.success) {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: oldQty } : item)));
        notifications.show({ title: "Update Failed", message: json.message || "Could not update quantity", color: "red", position: "top-left" });
      }
    } catch {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: oldQty } : item)));
      notifications.show({ title: "Error", message: "Internal server error", color: "red", position: "top-left" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        notifications.show({ message: "Item removed from cart", color: "gray", position: "top-left" });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const isCheckoutDisabled =
    (deliveryMethod === DeliveryMethod.SHIP && !address.trim()) || (deliveryMethod === DeliveryMethod.PICKUP && !selectedShop);

  const checkoutFormJSX = (
    <Stack gap="md">
      <Box bg="gray.0" p="md" style={{ borderRadius: rem(12) }}>
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Order Subtotal
          </Text>
          <Text fw={900} size="xl" c="dark">
            {formatRupiah(totalAmount)}
          </Text>
        </Group>
        <Text size="10px" c="dimmed">
          Taxes and discounts calculated at checkout
        </Text>
      </Box>

      <TextInput
        placeholder="Voucher Code"
        leftSection={<IconTicket size={16} stroke={1.5} />}
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.currentTarget.value)}
        radius="md"
        size="md"
      />

      <Stack gap="xs">
        <Text fw={600} size="sm">
          Delivery
        </Text>

        <Group grow>
          <UnstyledButton
            onClick={() => setDeliveryMethod(DeliveryMethod.SHIP)}
            style={{
              borderRadius: 10,
              border: deliveryMethod === DeliveryMethod.SHIP ? "2px solid black" : "1px solid #e9ecef",
              background: deliveryMethod === DeliveryMethod.SHIP ? "#fff" : "#f8f9fa",
              padding: "10px 12px",
              transition: "all 0.15s ease",
            }}
          >
            <Group justify="center" gap={6}>
              <IconTruckDelivery size={18} stroke={1.8} />
              <Text size="sm" fw={500}>
                Ship
              </Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
            style={{
              borderRadius: 10,
              border: deliveryMethod === DeliveryMethod.PICKUP ? "2px solid black" : "1px solid #e9ecef",
              background: deliveryMethod === DeliveryMethod.PICKUP ? "#fff" : "#f8f9fa",
              padding: "10px 12px",
              transition: "all 0.15s ease",
            }}
          >
            <Group justify="center" gap={6}>
              <IconMapPin size={18} stroke={1.8} />
              <Text size="sm" fw={500}>
                Pickup
              </Text>
            </Group>
          </UnstyledButton>
        </Group>

        {deliveryMethod === DeliveryMethod.SHIP && (
          <Stack gap="xs" mt={4}>
            <Textarea
              placeholder="Street name, house number, district, city, postal code"
              label="Shipping Address"
              radius="md"
              size="sm"
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              required
              autosize
              minRows={2}
              maxRows={4}
            />

            <SimpleGrid cols={1} spacing="xs" mt={4}>
              <Select
                label="Country"
                placeholder="Select country"
                data={countries}
                value={countryIsoCode}
                onChange={(value) => {
                  setCountryIsoCode(value || "");
                  setProvinceCode("");
                  setCityCode("");
                  setSubDistrictCode("");
                  setVillageCode("");
                }}
                searchable
                size="sm"
                radius="xs"
              />

              <Select
                label="Province"
                placeholder="Select province"
                data={provinces}
                value={provinceCode}
                onChange={(value) => {
                  setProvinceCode(value || "");
                  setCityCode("");
                  setSubDistrictCode("");
                  setVillageCode("");
                }}
                searchable
                disabled={!countryIsoCode}
                size="sm"
                radius="xs"
              />

              <Select
                label="City / Regency"
                placeholder="Select city"
                data={cities}
                value={cityCode}
                onChange={(value) => {
                  setCityCode(value || "");
                  setSubDistrictCode("");
                  setVillageCode("");
                }}
                searchable
                disabled={!provinceCode}
                size="sm"
                radius="xs"
              />

              <Select
                label="Sub District"
                placeholder="Select sub district"
                data={subDistricts}
                value={subDistrictCode}
                onChange={(value) => {
                  setSubDistrictCode(value || "");
                  setVillageCode("");
                }}
                searchable
                disabled={!cityCode}
                size="sm"
                radius="xs"
              />

              <Select
                label="Village"
                placeholder="Select village"
                data={villages}
                value={villageCode}
                onChange={(value) => setVillageCode(value || "")}
                searchable
                disabled={!subDistrictCode}
                size="sm"
                radius="xs"
              />

              <TextInput
                label="Postal Code"
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.currentTarget.value)}
                size="sm"
                radius="xs"
              />
            </SimpleGrid>
          </Stack>
        )}

        {deliveryMethod === DeliveryMethod.PICKUP && (
          <Stack gap="xs" mt={4}>
            {listShop.map((item) => (
              <Box
                key={item.id}
                onClick={() => setSelectedShop(item.id)}
                p="sm"
                style={{
                  borderRadius: 12,
                  cursor: "pointer",
                  border: selectedShop === item.id ? "2px solid black" : "1px solid #e9ecef",
                  background: selectedShop === item.id ? "#fff" : "#f8f9fa",
                  transition: "all 0.15s ease",
                }}
              >
                <Text fw={600} size="sm">
                  {item.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {item.address || "No address"}
                </Text>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Button
        fullWidth
        color="dark"
        radius="md"
        size="lg"
        onClick={() => handleCheckout(voucherCode)}
        loading={isCheckoutLoading}
        disabled={isCheckoutDisabled}
        style={{ height: rem(54) }}
      >
        CHECKOUT NOW
      </Button>

      <Text ta="center" size="xs" c="dimmed">
        By clicking checkout, you agree to our terms and conditions.
      </Text>
    </Stack>
  );

  return (
    <Modal
      opened={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      title={
        <Group gap="sm">
          <IconShoppingCart size={22} stroke={2} />
          <Text fw={900} size="xl" lts={-0.5}>
            MY CART
          </Text>
          <Badge>{cartItems.length}</Badge>
        </Group>
      }
      size={isMobile ? "100%" : "90vw"}
      fullScreen={isMobile}
      radius={isMobile ? 0 : "lg"}
      overlayProps={{ backgroundOpacity: 0.3, blur: 8 }}
      styles={{
        header: {
          borderBottom: "1px solid #f1f3f5",
          paddingBottom: rem(14),
          marginBottom: 0,
        },
        body: {
          padding: 0,
          ...(isMobile && {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }),
        },
        ...(isMobile && {
          content: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }),
      }}
    >
      {(loadingCart || cartItems.length === 0) && (
        <Center py={80}>
          {loadingCart ? (
            <Stack align="center" gap="xs">
              <Loader size="sm" color="dark" type="dots" />
              <Text size="xs" c="dimmed">
                Syncing your cart...
              </Text>
            </Stack>
          ) : (
            <Stack align="center" gap="md">
              <Box p="xl" bg="gray.0" style={{ borderRadius: "50%" }}>
                <IconShoppingCart size={50} stroke={1} color="var(--mantine-color-gray-4)" />
              </Box>
              <Text ta="center" fw={600} c="gray.6">
                Your cart is empty
              </Text>
              <Button variant="subtle" color="dark" onClick={() => setIsDrawerOpen(false)}>
                Go back
              </Button>
            </Stack>
          )}
        </Center>
      )}

      {!loadingCart && cartItems.length > 0 && isMobile && (
        <ScrollArea style={{ flex: 1 }} scrollbarSize={4} offsetScrollbars type="scroll">
          <Stack gap="md" p="md">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} processingId={processingId} onRemove={handleRemoveItem} onUpdate={handleUpdateQuantity} />
            ))}

            <Box style={{ borderTop: "1px solid #f1f3f5" }} pt="md">
              {checkoutFormJSX}
            </Box>
          </Stack>
        </ScrollArea>
      )}

      {!loadingCart && cartItems.length > 0 && !isMobile && (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            maxHeight: "80vh",
          }}
        >
          <ScrollArea style={{ borderRight: "1px solid #f1f3f5" }} h={850} scrollbarSize={4} offsetScrollbars type="scroll">
            <Stack gap="md" p="xl">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} processingId={processingId} onRemove={handleRemoveItem} onUpdate={handleUpdateQuantity} />
              ))}
            </Stack>
          </ScrollArea>

          <ScrollArea scrollbarSize={4} offsetScrollbars type="scroll">
            <Box p="xl">{checkoutFormJSX}</Box>
          </ScrollArea>
        </Box>
      )}
    </Modal>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <Box bg="dark" c="white" px={8} style={{ borderRadius: 4, fontSize: 10, fontWeight: 800, lineHeight: "20px" }}>
    {children}
  </Box>
);
