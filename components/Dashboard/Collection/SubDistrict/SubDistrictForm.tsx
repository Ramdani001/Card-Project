"use client";

import { ProvinceDto } from "@/types/dtos/ProvinceDto";
import { SubDistrictDto } from "@/types/dtos/SubDistrictDto";
import { Button, Flex, Modal, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface SubDistrictFormProps {
  opened: boolean;
  onClose: () => void;
  subDistrictToEdit: SubDistrictDto | null;
  onSuccess: () => void;
}

export const SubDistrictForm = ({ opened, onClose, subDistrictToEdit, onSuccess }: SubDistrictFormProps) => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<ProvinceDto[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    cityId: "",
  });

  const isEditMode = Boolean(subDistrictToEdit);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cities`);
      const json = await res.json();

      if (json.success) {
        setCities(json.data);
      } else {
        notifications.show({
          title: "Error",
          message: json.message,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subDistrictToEdit) {
      setForm({
        name: subDistrictToEdit.name,
        code: subDistrictToEdit.code,
        cityId: subDistrictToEdit.cityId,
      });
    } else {
      setForm({
        name: "",
        code: "",
        cityId: "",
      });
    }

    fetchCountries();
  }, [subDistrictToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        code: form.code,
        cityId: form.cityId,
      };

      const url = isEditMode ? `/api/sub-districts/${subDistrictToEdit?.id}` : "/api/sub-districts";

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

  const parentOptions = cities
    .filter((m) => m.id !== subDistrictToEdit?.id)
    .map((m) => ({
      value: m.id,
      label: `${m.name}`,
    }));

  return (
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Sub District" : "Create New Sub District"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} withAsterisk data-autofocus />
        <TextInput label="Code" value={form.code} onChange={(e) => handleChange("code", e.target.value)} withAsterisk />
        <Select
          label="City"
          placeholder="Select City"
          data={parentOptions}
          value={form.cityId}
          onChange={(e) => handleChange("cityId", e || "")}
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
