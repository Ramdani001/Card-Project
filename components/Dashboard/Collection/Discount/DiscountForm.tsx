"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Modal, NumberInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Discount } from "@/types/Discount";

interface DiscountFormProps {
  opened: boolean;
  onClose: () => void;
  discountToEdit: Discount | null;
  onSuccess: () => void;
}

export const DiscountForm = ({ opened, onClose, discountToEdit, onSuccess }: DiscountFormProps) => {
  const [loading, setLoading] = useState(false);

  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (discountToEdit) {
      setDiscountValue(discountToEdit.discount);
      setNote(discountToEdit.note || "");
    } else {
      setDiscountValue("");
      setNote("");
    }
  }, [discountToEdit, opened]);

  const handleSubmit = async () => {
    if (discountValue === "" || discountValue === 0) {
      return notifications.show({ message: "Discount value required", color: "red" });
    }

    setLoading(true);
    try {
      const isEditing = !!discountToEdit;
      const url = isEditing ? `/api/discounts/${discountToEdit.idDiscount}` : "/api/discounts";
      const method = isEditing ? "PATCH" : "POST";

      const bodyData = {
        discount: Number(discountValue),
        note: note,
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
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
    <Modal opened={opened} onClose={onClose} title={discountToEdit ? "Edit Discount" : "Create Discount"} centered>
      <NumberInput
        label="Discount Value (%)"
        placeholder="e.g. 10"
        value={discountValue}
        onChange={(val) => setDiscountValue(Number(val))}
        min={0}
        max={100}
        mb="md"
        withAsterisk
        suffix="%"
      />

      <Textarea
        label="Note"
        placeholder="Promo Lebaran, Flash Sale, etc..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        minRows={3}
        mb="lg"
      />

      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {discountToEdit ? "Update" : "Create"}
        </Button>
      </Flex>
    </Modal>
  );
};
