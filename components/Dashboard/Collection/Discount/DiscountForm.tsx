"use client";

import { DiscountDto } from "@/types/DiscountDto";
import { Button, Flex, Modal, NumberInput, SegmentedControl, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface DiscountFormProps {
  opened: boolean;
  onClose: () => void;
  discountToEdit: DiscountDto | null;
  onSuccess: () => void;
}

export const DiscountForm = ({ opened, onClose, discountToEdit, onSuccess }: DiscountFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<"NOMINAL" | "PERCENTAGE">("PERCENTAGE");
  const [value, setValue] = useState<number | "">("");

  useEffect(() => {
    if (discountToEdit) {
      setName(discountToEdit.name);
      setType(discountToEdit.type);
      setValue(Number(discountToEdit.value));
    } else {
      setName("");
      setType("PERCENTAGE");
      setValue("");
    }
  }, [discountToEdit, opened]);

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Name is required", color: "red" });
    if (value === "" || value === undefined) return notifications.show({ message: "Value is required", color: "red" });

    if (type === "PERCENTAGE" && Number(value) > 100) {
      return notifications.show({ message: "Percentage cannot exceed 100%", color: "red" });
    }

    setLoading(true);
    try {
      const payload = {
        name,
        type,
        value: Number(value),
      };

      const isEditMode = !!discountToEdit;
      const url = isEditMode ? `/api/discounts/${discountToEdit.id}` : "/api/discounts";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        notifications.show({ title: "Success", message: json.message, color: "teal", icon: <IconCheck size={16} /> });
        onClose();
        onSuccess();
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={discountToEdit ? "Edit Discount" : "Create New Discount"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput label="Discount Name" placeholder="e.g. Flash Sale 12.12" value={name} onChange={(e) => setName(e.target.value)} withAsterisk />

        <div>
          <Text size="sm" fw={500} mb={4}>
            Discount Type
          </Text>
          <SegmentedControl
            fullWidth
            value={type}
            onChange={(val) => setType(val as "NOMINAL" | "PERCENTAGE")}
            data={[
              { label: "Percentage (%)", value: "PERCENTAGE" },
              { label: "Nominal (Rp)", value: "NOMINAL" },
            ]}
          />
        </div>

        <NumberInput
          label="Value"
          placeholder={type === "PERCENTAGE" ? "10" : "10000"}
          value={value}
          onChange={(val) => setValue(val === "" ? "" : Number(val))}
          max={type === "PERCENTAGE" ? 100 : undefined}
          min={0}
          suffix={type === "PERCENTAGE" ? "%" : undefined}
          prefix={type === "NOMINAL" ? "Rp " : undefined}
          thousandSeparator={type === "NOMINAL" ? "." : undefined}
          decimalSeparator={type === "NOMINAL" ? "," : undefined}
          withAsterisk
        />

        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {discountToEdit ? "Update" : "Create"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
