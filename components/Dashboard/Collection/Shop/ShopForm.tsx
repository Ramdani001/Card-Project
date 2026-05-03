"use client";

import { ShopDto } from "@/types/dtos/ShopDto";
import { Button, Flex, Modal, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ShopFormProps {
  opened: boolean;
  onClose: () => void;
  shopToEdit: ShopDto | null;
  onSuccess: () => void;
}

export const ShopForm = ({ opened, onClose, shopToEdit, onSuccess }: ShopFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const isEditMode = Boolean(shopToEdit);

  useEffect(() => {
    if (shopToEdit) {
      setForm({
        name: shopToEdit.name,
        address: shopToEdit.address || "",
      });
    } else {
      setForm({
        name: "",
        address: "",
      });
    }
  }, [shopToEdit, opened]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      notifications.show({
        message: "Shop Name is required",
        color: "red",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("address", form.address);

      const url = isEditMode ? `/api/shops/${shopToEdit?.id}` : "/api/shops";

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
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
    <Modal opened={opened} onClose={onClose} title={isEditMode ? "Edit Shop" : "Create New Shop"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} withAsterisk data-autofocus />
        <Textarea
          label="Address"
          withAsterisk
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          autosize
          minRows={3}
          maxRows={6}
          styles={{
            input: {
              resize: "vertical",
            },
          }}
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
