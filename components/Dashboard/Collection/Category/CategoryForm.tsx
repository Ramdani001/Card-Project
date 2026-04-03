"use client";

import { CategoryCardDto } from "@/types/dtos/CategoryCardDto";
import { Box, Button, FileInput, Flex, Image, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CategoryFormProps {
  opened: boolean;
  onClose: () => void;
  categoryToEdit: CategoryCardDto | null;
  onSuccess: () => void;
}

export const CategoryForm = ({ opened, onClose, categoryToEdit, onSuccess }: CategoryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setNote(categoryToEdit.note || "");
      setPreviewUrl(categoryToEdit.urlImage || null);
    } else {
      setName("");
      setNote("");
      setPreviewUrl(null);
    }
    setFile(null);
  }, [categoryToEdit, opened]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (newFile) {
      const url = URL.createObjectURL(newFile);
      setPreviewUrl(url);
    } else if (categoryToEdit?.urlImage) {
      setPreviewUrl(categoryToEdit.urlImage);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return notifications.show({ message: "Category Name is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("note", note);

      if (file) {
        formData.append("file", file);
      }

      const isEditMode = !!categoryToEdit;
      const url = isEditMode ? `/api/categories/${categoryToEdit.id}` : "/api/categories";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        notifications.show({
          title: "Success",
          message: json.message,
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        onClose();
        onSuccess();
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Network error",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={categoryToEdit ? "Edit Category" : "Create New Category"} centered size="md">
      <Flex direction="column" gap="md">
        <TextInput
          label="Category Name"
          placeholder="e.g. Programming, Cooking..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          withAsterisk
          data-autofocus
        />

        <Stack gap="xs">
          <FileInput
            label="Category Image"
            placeholder={"Upload image"}
            leftSection={<IconUpload size={14} />}
            value={file}
            onChange={handleFileChange}
            accept="image/*"
            clearable
            description="Format: JPG, PNG, WEBP (Max 2MB)"
          />

          {previewUrl ? (
            <Box pos="relative" style={{ border: "1px solid #e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
              <Image src={previewUrl} alt="Category preview" height={150} fit="contain" />
            </Box>
          ) : (
            <Flex justify="center" align="center" h={150} style={{ border: "2px dashed #e0e0e0", borderRadius: "4px" }} bg="gray.0">
              <Stack align="center" gap={5} color="dimmed">
                <IconPhoto size={30} stroke={1.5} />
                <Text size="xs">No image selected</Text>
              </Stack>
            </Flex>
          )}
        </Stack>

        <Textarea
          label="Note"
          placeholder="Optional description for this category..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          minRows={3}
        />

        <Flex justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} px="xl">
            {categoryToEdit ? "Update" : "Create"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
