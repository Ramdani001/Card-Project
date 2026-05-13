"use client";

import { CountryDto } from "@/types/dtos/CountryDto";
import { ProvinceDto } from "@/types/dtos/ProvinceDto";
import { Button, Flex, Modal, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ProvinceFormProps {
  opened: boolean;
  onClose: () => void;
  provinceToEdit: ProvinceDto | null;
  onSuccess: () => void;
}

export const ProvinceForm = ({ opened, onClose, provinceToEdit, onSuccess }: ProvinceFormProps) => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    countryId: "",
  });

  const isEditMode = Boolean(provinceToEdit);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/countries`);
      const json = await res.json();

      if (json.success) {
        setCountries(json.data);
      } else {
        notifications.show({
          title: "Error",
          message: json.message,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provinceToEdit) {
      setForm({
        name: provinceToEdit.name,
        code: provinceToEdit.code,
        countryId: provinceToEdit.countryId,
      });
    } else {
      setForm({
        name: "",
        code: "",
        countryId: "",
      });
    }

    fetchCountries();
  }, [provinceToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        code: form.code,
        countryId: form.countryId,
      };

      const url = isEditMode ? `/api/provincies/${provinceToEdit?.id}` : "/api/provincies";

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message);
      }

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

  const parentOptions = countries
    .filter((m) => m.id !== provinceToEdit?.id)
    .map((m) => ({
      value: m.id,
      label: `${m.name}`,
    }));

  return (
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Province" : "Create New Province"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} withAsterisk data-autofocus />
        <TextInput label="Code" value={form.code} onChange={(e) => handleChange("code", e.target.value)} withAsterisk />
        <Select
          label="Country"
          placeholder="Select Country"
          data={parentOptions}
          value={form.countryId}
          onChange={(e) => handleChange("countryId", e || "")}
          clearable
          searchable
          checkIconPosition="right"
        />
        <Flex justify="flex-end" gap="sm" mt="md">
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
