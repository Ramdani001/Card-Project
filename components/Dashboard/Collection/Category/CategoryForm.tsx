"use client";

import { CategoryCard } from "@/types/CategoryCard";
import { Button, Modal, Textarea, TextInput, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CategoryFormProps {
  opened: boolean;
  onClose: () => void;
  categoryToEdit: CategoryCard | null;
  onSuccess: () => void;
}

export const CategoryForm = ({ opened, onClose, categoryToEdit, onSuccess }: CategoryFormProps) => {
  const [loading, setLoading] = useState(false);

  // State
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  // Populate Form
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setNote(categoryToEdit.note || "");
    } else {
      setName("");
      setNote("");
    }
  }, [categoryToEdit, opened]);

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Category Name is required", color: "red" });

    setLoading(true);
    try {
      const payload = { name, note };

      const isEditMode = !!categoryToEdit;
      const url = isEditMode ? `/api/categories/${categoryToEdit.id}` : "/api/categories";
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
    <Modal opened={opened} onClose={onClose} title={categoryToEdit ? "Edit Category" : "Create New Category"} centered>
      <Flex direction="column" gap="md">
        <TextInput label="Category Name" placeholder="Category" value={name} onChange={(e) => setName(e.target.value)} withAsterisk data-autofocus />

        <Textarea label="Note" placeholder="Optional description..." value={note} onChange={(e) => setNote(e.target.value)} minRows={3} />

        <Flex justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {categoryToEdit ? "Update" : "Create"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
