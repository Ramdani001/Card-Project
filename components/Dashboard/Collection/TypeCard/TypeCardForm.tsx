"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Modal, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { TypeCard } from "@/types/TypeCard";

interface TypeCardFormProps {
  opened: boolean;
  onClose: () => void;
  typeCardToEdit: TypeCard | null;
  onSuccess: () => void;
}

export const TypeCardForm = ({ opened, onClose, typeCardToEdit, onSuccess }: TypeCardFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (typeCardToEdit) {
      setName(typeCardToEdit.name);
      setNote(typeCardToEdit.note || "");
    } else {
      setName("");
      setNote("");
    }
  }, [typeCardToEdit, opened]);

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Name required", color: "red" });

    setLoading(true);
    try {
      const isEditing = !!typeCardToEdit;
      const url = isEditing ? `/api/type-cards/${typeCardToEdit.idTypeCard}` : "/api/type-cards";
      const method = isEditing ? "PATCH" : "POST";

      const bodyData = {
        name,
        note,
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
    <Modal opened={opened} onClose={onClose} title={typeCardToEdit ? "Edit Type Card" : "Create Type Card"} centered>
      <TextInput
        label="Type Name"
        placeholder="e.g. Gold, Platinum, Regular"
        value={name}
        onChange={(e) => setName(e.target.value)}
        mb="md"
        withAsterisk
      />

      <Textarea label="Note" placeholder="Optional description..." value={note} onChange={(e) => setNote(e.target.value)} minRows={3} mb="lg" />

      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {typeCardToEdit ? "Update" : "Create"}
        </Button>
      </Flex>
    </Modal>
  );
};
