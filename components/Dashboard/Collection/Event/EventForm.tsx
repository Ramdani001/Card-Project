"use client";

import { EventDto } from "@/types/dtos/EventDto";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  FileInput,
  Flex,
  Image,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface EventFormProps {
  opened: boolean;
  onClose: () => void;
  eventToEdit: EventDto | null;
  onSuccess: () => void;
}

export const EventForm = ({ opened, onClose, eventToEdit, onSuccess }: EventFormProps) => {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState<Date | null | string>(null);
  const [endDate, setEndDate] = useState<Date | null | string>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  useEffect(() => {
    if (opened) {
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setContent(eventToEdit.content || "");
        setStartDate(eventToEdit.startDate ? new Date(eventToEdit.startDate) : null);
        setEndDate(eventToEdit.endDate ? new Date(eventToEdit.endDate) : null);
        setExistingImages(eventToEdit.images || []);
      } else {
        setTitle("");
        setContent("");
        setStartDate(new Date());
        setEndDate(new Date(Date.now() + 3600 * 1000));
        setExistingImages([]);
      }
      setFiles([]);
      setPreviews([]);
      setRemovedImageIds([]);
    }
  }, [eventToEdit, opened]);

  const handleFileChange = (newFiles: File[]) => {
    // Menambah file baru ke daftar yang sudah ada (append)
    const combinedFiles = [...files, ...newFiles];
    setFiles(combinedFiles);

    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleRemoveNewFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!title) return notifications.show({ message: "Title is required", color: "red" });
    if (!startDate || !endDate) return notifications.show({ message: "Date is required", color: "red" });
    if (endDate < startDate) return notifications.show({ message: "End date must be after Start date", color: "red" });

    if (existingImages.length === 0 && files.length === 0) {
      return notifications.show({ message: "At least one image is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());

      formData.append("removedImageIds", JSON.stringify(removedImageIds));

      files.forEach((file) => {
        formData.append("images", file);
      });

      const isEditMode = !!eventToEdit;
      const url = isEditMode ? `/api/events/${eventToEdit.id}` : "/api/events";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: formData });
      const json = await res.json();

      if (json.success) {
        notifications.show({ title: "Success", message: json.message, color: "teal", icon: <IconCheck size={16} /> });
        onClose();
        onSuccess();
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      notifications.show({ title: "Error", message: error.message || "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={eventToEdit ? "Edit Event" : "Create New Event"} centered size="lg">
      <Stack gap="md">
        <TextInput label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} withAsterisk />

        <Flex gap="md">
          <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} style={{ flex: 1 }} withAsterisk />
          <DateTimePicker label="End Date" value={endDate} onChange={setEndDate} minDate={startDate || undefined} style={{ flex: 1 }} withAsterisk />
        </Flex>

        <Textarea label="Content / Description" value={content} onChange={(e) => setContent(e.target.value)} minRows={4} />

        <FileInput
          label="Event Images"
          placeholder="Upload images"
          accept="image/*"
          multiple
          leftSection={<IconUpload size={16} />}
          onChange={handleFileChange}
        />

        {(existingImages.length > 0 || previews.length > 0) && (
          <Paper withBorder p="sm" radius="md">
            <Text size="xs" c="dimmed" mb="xs">
              Gallery Preview (Existing & New)
            </Text>
            <SimpleGrid cols={4} spacing="xs">
              {existingImages.map((img) => (
                <Box key={img.id} pos="relative">
                  <AspectRatio ratio={1 / 1}>
                    <Image src={img.url} radius="sm" fit="cover" alt="" />
                  </AspectRatio>
                  <ActionIcon
                    color="red"
                    variant="filled"
                    pos="absolute"
                    top={2}
                    right={2}
                    radius="xl"
                    size="sm"
                    onClick={() => handleRemoveExistingImage(img.id)}
                  >
                    <IconTrash size={12} />
                  </ActionIcon>
                </Box>
              ))}

              {previews.map((url, index) => (
                <Box key={index} pos="relative">
                  <AspectRatio ratio={1 / 1}>
                    <Image src={url} radius="sm" fit="cover" opacity={0.8} alt="" />
                  </AspectRatio>
                  <ActionIcon
                    color="gray"
                    variant="filled"
                    pos="absolute"
                    top={2}
                    right={2}
                    radius="xl"
                    size="sm"
                    onClick={() => handleRemoveNewFile(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
          </Paper>
        )}

        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {eventToEdit ? "Update Event" : "Create Event"}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
};
