"use client";

import { SubDistrictDto } from "@/types/dtos/SubDistrictDto";
import { VillageDto } from "@/types/dtos/VillageDto";
import { Button, Flex, Modal, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface VillageFormProps {
  opened: boolean;
  onClose: () => void;
  villageToEdit: VillageDto | null;
  onSuccess: () => void;
}

export const VillageForm = ({ opened, onClose, villageToEdit, onSuccess }: VillageFormProps) => {
  const [loading, setLoading] = useState(false);
  const [subDistricts, setSubDistricts] = useState<SubDistrictDto[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    subDistrictId: "",
  });

  const isEditMode = Boolean(villageToEdit);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sub-districts`);
      const json = await res.json();

      if (json.success) {
        setSubDistricts(json.data);
      } else {
        notifications.show({
          title: "Error",
          message: json.message,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Error fetching subDistricts:", error);
      notifications.show({ title: "Error", message: "Failed to fetch data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (villageToEdit) {
      setForm({
        name: villageToEdit.name,
        code: villageToEdit.code,
        subDistrictId: villageToEdit.subDistrictId,
      });
    } else {
      setForm({
        name: "",
        code: "",
        subDistrictId: "",
      });
    }

    fetchCountries();
  }, [villageToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        code: form.code,
        subDistrictId: form.subDistrictId,
      };

      const url = isEditMode ? `/api/villages/${villageToEdit?.id}` : "/api/villages";

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

  const parentOptions = subDistricts
    .filter((m) => m.id !== villageToEdit?.id)
    .map((m) => ({
      value: m.id,
      label: `${m.name}`,
    }));

  return (
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Village" : "Create New Village"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} withAsterisk data-autofocus />
        <TextInput label="Code" value={form.code} onChange={(e) => handleChange("code", e.target.value)} withAsterisk />
        <Select
          label="Sub District"
          placeholder="Select Sub District"
          data={parentOptions}
          value={form.subDistrictId}
          onChange={(e) => handleChange("subDistrictId", e || "")}
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
