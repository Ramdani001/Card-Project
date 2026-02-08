"use client";

import { Event } from "@/types/Event";
import { ActionIcon, Button, FileInput, Flex, Image, Modal, Paper, SimpleGrid, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface EventFormProps {
  opened: boolean;
  onClose: () => void;
  eventToEdit: Event | null;
  onSuccess: () => void;
}

// Helper untuk preview
const getPreviewUrl = (file: File) => URL.createObjectURL(file);

export const EventForm = ({ opened, onClose, eventToEdit, onSuccess }: EventFormProps) => {
  const [loading, setLoading] = useState(false);

  // State form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState<Date | string>(new Date());
  const [endDate, setEndDate] = useState<Date | string>(new Date());
  const [files, setFiles] = useState<File[]>([]);

  // State untuk gambar lama (hanya view mode saat edit)
  const [existingImages, setExistingImages] = useState<any[]>([]);

  // Reset form saat modal dibuka/tutup
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setContent(eventToEdit.content);
      setStartDate(new Date(eventToEdit.startDate));
      setEndDate(new Date(eventToEdit.endDate));
      setExistingImages(eventToEdit.images || []);
      setFiles([]);
    } else {
      setTitle("");
      setContent("");
      setStartDate(new Date());
      setEndDate(new Date());
      setExistingImages([]);
      setFiles([]);
    }
  }, [eventToEdit, opened]);

  const handleSubmit = async () => {
    if (!title) return notifications.show({ message: "Title required", color: "red" });
    if (!content) return notifications.show({ message: "Content required", color: "red" });
    if (endDate < startDate) return notifications.show({ message: "End date error", color: "red" });

    setLoading(true);
    try {
      // --- PERUBAHAN UTAMA DI SINI ---
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());

      // Append gambar baru (bisa multiple)
      files.forEach((file) => {
        formData.append("images", file);
      });

      const isEditing = !!eventToEdit;
      const url = isEditing ? `/api/events/${eventToEdit.idEvent}` : "/api/events";
      const method = isEditing ? "PATCH" : "POST";

      // Fetch tanpa Header Content-Type (Browser otomatis set boundary multipart)
      const res = await fetch(url, {
        method: method,
        body: formData,
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal opened={opened} onClose={onClose} title={eventToEdit ? "Edit Event" : "Create Event"} centered size="lg">
      <TextInput label="Title" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} mb="sm" withAsterisk />

      <Flex gap="md" mb="sm">
        <DateTimePicker label="Start Date" value={startDate} onChange={(val) => setStartDate(val || new Date())} style={{ flex: 1 }} withAsterisk />
        <DateTimePicker label="End Date" value={endDate} onChange={(val) => setEndDate(val || new Date())} style={{ flex: 1 }} withAsterisk />
      </Flex>

      <Textarea
        label="Content"
        placeholder="Description..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minRows={4}
        mb="md"
        withAsterisk
      />

      <FileInput
        label="Upload Images"
        description="Select images"
        placeholder="Click to select"
        multiple
        accept="image/png,image/jpeg"
        leftSection={<IconUpload size={16} />}
        clearable
        value={files}
        onChange={setFiles}
        mb="md"
      />

      {/* Preview Grid */}
      {(files.length > 0 || existingImages.length > 0) && (
        <SimpleGrid cols={4} spacing="xs" mb="lg">
          {existingImages.map((img) => (
            <Paper key={img.idImage} withBorder p={4}>
              <Image src={img.location} h={80} fit="cover" radius="sm" alt="Old" />
            </Paper>
          ))}
          {files.map((file, index) => {
            const url = getPreviewUrl(file);
            return (
              <Paper key={index} withBorder p={4} pos="relative">
                <Image src={url} h={80} fit="cover" radius="sm" onLoad={() => URL.revokeObjectURL(url)} alt="New" />
                <ActionIcon color="red" size="xs" radius="xl" variant="filled" pos="absolute" top={-5} right={-5} onClick={() => removeFile(index)}>
                  <IconX size={10} />
                </ActionIcon>
              </Paper>
            );
          })}
        </SimpleGrid>
      )}

      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {eventToEdit ? "Update" : "Create"}
        </Button>
      </Flex>
    </Modal>
  );
};
