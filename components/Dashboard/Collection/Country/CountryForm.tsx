"use client";

import { CountryDto } from "@/types/dtos/CountryDto";
import { Button, Flex, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CountryFormProps {
  opened: boolean;
  onClose: () => void;
  countryToEdit: CountryDto | null;
  onSuccess: () => void;
}

export const CountryForm = ({ opened, onClose, countryToEdit, onSuccess }: CountryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    isoCode: "",
  });

  const isEditMode = Boolean(countryToEdit);

  useEffect(() => {
    if (countryToEdit) {
      setForm({
        name: countryToEdit.name,
        isoCode: countryToEdit.isoCode,
      });
    } else {
      setForm({
        name: "",
        isoCode: "",
      });
    }
  }, [countryToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      notifications.show({
        message: "Country Name is required",
        color: "red",
      });

      return;
    }
    if (!form.isoCode.trim()) {
      notifications.show({
        message: "ISO Code is required",
        color: "red",
      });

      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        isoCode: form.isoCode,
      };

      const url = isEditMode ? `/api/countries/${countryToEdit?.id}` : "/api/countries";

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

  return (
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Country" : "Create New Country"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} withAsterisk data-autofocus />
        <TextInput label="ISO Code" value={form.isoCode} onChange={(e) => handleChange("isoCode", e.target.value)} withAsterisk />

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
