"use client";

import { CourierDto } from "@/types/dtos/CourierDto";
import { Button, Flex, Modal, Switch, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CourierFormProps {
  opened: boolean;
  onClose: () => void;
  courierToEdit: CourierDto | null;
  onSuccess: () => void;
}

interface CourierFormState {
  courierCode: string;
  status: boolean;
}

export const CourierForm = ({ opened, onClose, courierToEdit, onSuccess }: CourierFormProps) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CourierFormState>({
    courierCode: "",
    status: false,
  });

  const isEditMode = Boolean(courierToEdit);

  useEffect(() => {
    if (courierToEdit && opened) {
      setForm({
        courierCode: courierToEdit.courierCode,
        status: courierToEdit.status || false,
      });
    } else if (!opened) {
      setForm({
        courierCode: "",
        status: false,
      });
    }
  }, [courierToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const isAddressIncomplete = !form.courierCode.trim();

    if (isAddressIncomplete) {
      return notifications.show({
        title: "Incomplete Address Info",
        message: "Please ensure all address fields (Province, City, etc.) are filled.",
        color: "red",
        position: "top-left",
      });
    }

    setLoading(true);

    try {
      const url = isEditMode ? `/api/couriers/${courierToEdit?.id}` : "/api/couriers";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courierCode: form.courierCode.trim(),
          status: form.status,
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
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Courier" : "Create New Courier"} centered size="md">
      <Flex direction="column" gap="sm">
        <TextInput
          label="Courier Code"
          placeholder="Enter courier code"
          value={form.courierCode}
          onChange={(e) => handleChange("courierCode", e.target.value)}
          withAsterisk
          data-autofocus
        />

        <Switch label="Status" checked={form.status} onChange={(e) => handleChange("status", e.currentTarget.checked)} mt="xs" />

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
