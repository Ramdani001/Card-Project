"use client";

import { Option } from "@/types/dtos/Option";
import { ShopDto } from "@/types/dtos/ShopDto";
import { Button, Flex, Modal, Textarea, TextInput, Select, Switch } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ShopFormProps {
  opened: boolean;
  onClose: () => void;
  shopToEdit: ShopDto | null;
  onSuccess: () => void;
}

interface ShopFormState {
  name: string;
  address: string;
  countryIsoCode: string;
  provinceCode: string;
  cityCode: string;
  subDistrictCode: string;
  villageCode: string;
  postalCode: string;
  isMainShop: boolean;
}

export const ShopForm = ({ opened, onClose, shopToEdit, onSuccess }: ShopFormProps) => {
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [subDistricts, setSubDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [form, setForm] = useState<ShopFormState>({
    name: "",
    address: "",
    countryIsoCode: "",
    provinceCode: "",
    cityCode: "",
    subDistrictCode: "",
    villageCode: "",
    postalCode: "",
    isMainShop: false,
  });

  const isEditMode = Boolean(shopToEdit);

  // 1. Sinkronisasi Data saat Edit Mode atau Modal Terbuka
  useEffect(() => {
    if (shopToEdit && opened) {
      setForm({
        name: shopToEdit.name,
        address: shopToEdit.address || "",
        countryIsoCode: shopToEdit.countryIsoCode || "",
        provinceCode: shopToEdit.provinceCode || "",
        cityCode: shopToEdit.cityCode || "",
        subDistrictCode: shopToEdit.subDistrictCode || "",
        villageCode: shopToEdit.villageCode || "",
        postalCode: shopToEdit.postalCode || "",
        isMainShop: shopToEdit.isMainShop || false,
      });
    } else if (!opened) {
      setForm({
        name: "",
        address: "",
        countryIsoCode: "",
        provinceCode: "",
        cityCode: "",
        subDistrictCode: "",
        villageCode: "",
        postalCode: "",
        isMainShop: false,
      });
    }
  }, [shopToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/countries");
      const json = await res.json();
      setCountries(json.data.map((item: any) => ({ value: item.isoCode, label: item.name })));
    } catch (error) {
      console.error("Error fetch countries:", error);
    }
  };

  const fetchProvinces = async (countryCode: string) => {
    try {
      const res = await fetch(`/api/provincies?country.isoCode=${countryCode}`);
      const json = await res.json();
      setProvinces(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error("Error fetch provinces:", error);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      const res = await fetch(`/api/cities?province.code=${provinceCode}`);
      const json = await res.json();
      setCities(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error("Error fetch cities:", error);
    }
  };

  const fetchSubDistricts = async (cityCode: string) => {
    try {
      const res = await fetch(`/api/sub-districts?city.code=${cityCode}`);
      const json = await res.json();
      setSubDistricts(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error("Error fetch sub-districts:", error);
    }
  };

  const fetchVillages = async (subDistrictCode: string) => {
    try {
      const res = await fetch(`/api/villages?subDistrict.code=${subDistrictCode}`);
      const json = await res.json();
      setVillages(json.data.map((item: any) => ({ value: item.code, label: item.name })));
    } catch (error) {
      console.error("Error fetch villages:", error);
    }
  };

  useEffect(() => {
    if (opened) fetchCountries();
  }, [opened]);

  useEffect(() => {
    if (form.countryIsoCode) {
      fetchProvinces(form.countryIsoCode);
    } else {
      setProvinces([]);
    }
  }, [form.countryIsoCode]);

  useEffect(() => {
    if (form.provinceCode) {
      fetchCities(form.provinceCode);
    } else {
      setCities([]);
      setForm((p) => ({ ...p, cityCode: "", subDistrictCode: "", villageCode: "" }));
    }
  }, [form.provinceCode]);

  useEffect(() => {
    if (form.cityCode) {
      fetchSubDistricts(form.cityCode);
    } else {
      setSubDistricts([]);
      setForm((p) => ({ ...p, subDistrictCode: "", villageCode: "" }));
    }
  }, [form.cityCode]);

  useEffect(() => {
    if (form.subDistrictCode) {
      fetchVillages(form.subDistrictCode);
    } else {
      setVillages([]);
      setForm((p) => ({ ...p, villageCode: "" }));
    }
  }, [form.subDistrictCode]);

  const handleSubmit = async () => {
    const isAddressIncomplete = !form.address.trim() || !form.provinceCode || !form.cityCode || !form.subDistrictCode || !form.postalCode.trim();

    if (isAddressIncomplete) {
      return notifications.show({
        title: "Incomplete Address Info",
        message: "Please ensure all address fields (Province, City, etc.) are filled.",
        color: "red",
        position: "top-left",
      });
    }

    if (!form.name.trim()) {
      return notifications.show({
        message: "Shop Name is required",
        color: "red",
      });
    }

    setLoading(true);

    try {
      const url = isEditMode ? `/api/shops/${shopToEdit?.id}` : "/api/shops";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim(),
          countryIsoCode: form.countryIsoCode,
          provinceCode: form.provinceCode,
          cityCode: form.cityCode,
          subDistrictCode: form.subDistrictCode,
          villageCode: form.villageCode || null,
          postalCode: form.postalCode.trim(),
          isMainShop: form.isMainShop,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      notifications.show({
        title: "Success",
        message: json.message,
        color: "teal",
        icon: <IconCheck size={16} />,
      });

      onClose();
      onSuccess();
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Network error",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Shop" : "Create New Shop"} centered size="md">
      <Flex direction="column" gap="sm">
        <TextInput
          label="Shop Name"
          placeholder="Enter shop name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          withAsterisk
          data-autofocus
        />

        <Select
          label="Country"
          placeholder="Select Country"
          data={countries}
          value={form.countryIsoCode}
          onChange={(value) => handleChange("countryIsoCode", value)}
          searchable
          clearable
        />

        <Select
          label="Province"
          placeholder={form.countryIsoCode ? "Select Province" : "Select Country First"}
          data={provinces}
          value={form.provinceCode}
          onChange={(value) => handleChange("provinceCode", value)}
          disabled={!form.countryIsoCode}
          searchable
          clearable
          withAsterisk
        />

        <Select
          label="City"
          placeholder={form.provinceCode ? "Select City" : "Select Province First"}
          data={cities}
          value={form.cityCode}
          onChange={(value) => handleChange("cityCode", value)}
          disabled={!form.provinceCode}
          searchable
          clearable
          withAsterisk
        />

        <Select
          label="Sub District"
          placeholder={form.cityCode ? "Select Sub District" : "Select City First"}
          data={subDistricts}
          value={form.subDistrictCode}
          onChange={(value) => handleChange("subDistrictCode", value)}
          disabled={!form.cityCode}
          searchable
          clearable
          withAsterisk
        />

        <Select
          label="Village"
          placeholder={form.subDistrictCode ? "Select Village" : "Select Sub District First"}
          data={villages}
          value={form.villageCode}
          onChange={(value) => handleChange("villageCode", value)}
          disabled={!form.subDistrictCode}
          searchable
          clearable
        />

        <TextInput
          label="Postal Code"
          placeholder="e.g. 12345"
          value={form.postalCode}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          withAsterisk
        />

        <Textarea
          label="Detailed Address"
          placeholder="Street name, building number, block, etc."
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          withAsterisk
          autosize
          minRows={3}
          styles={{ input: { resize: "vertical" } }}
        />

        <Switch label="Set as Main Shop" checked={form.isMainShop} onChange={(e) => handleChange("isMainShop", e.currentTarget.checked)} mt="xs" />

        <Flex justify="flex-end" gap="sm" mt="xl">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} px="xl">
            {isEditMode ? "Update" : "Create"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
