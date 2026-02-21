"use client";

import { EventDto } from "@/types/EventDto";
import { AspectRatio, Button, FileInput, Flex, Image, Modal, Paper, SimpleGrid, Text, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
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
  const [startDate, setStartDate] = useState<Date | string | null>(null);
  const [endDate, setEndDate] = useState<Date | string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setContent(eventToEdit.content || "");
      setStartDate(new Date(eventToEdit.startDate));
      setEndDate(new Date(eventToEdit.endDate));
      setExistingImages(eventToEdit.images || []);

      setFiles([]);
      setPreviews([]);
    } else {
      setTitle("");
      setContent("");
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 3600 * 1000));
      setFiles([]);
      setPreviews([]);
      setExistingImages([]);
    }
  }, [eventToEdit, opened]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!title) return notifications.show({ message: "Title is required", color: "red" });
    if (!startDate || !endDate) return notifications.show({ message: "Start and End date required", color: "red" });
    if (endDate < startDate) return notifications.show({ message: "End date must be after Start date", color: "red" });

    const totalImages = existingImages.length + files.length;
    if (totalImages === 0) {
      return notifications.show({ message: "At least one image is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());

      files.forEach((file) => {
        formData.append("images", file);
      });

      const isEditMode = !!eventToEdit;
      const url = isEditMode ? `/api/events/${eventToEdit.id}` : "/api/events";
      const method = isEditMode ? "PATCH" : "POST";

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

  return (
    <Modal opened={opened} onClose={onClose} title={eventToEdit ? "Edit Event" : "Create New Event"} centered size="lg">
      <Flex direction="column" gap="md">
        <TextInput label="Event Title" placeholder="e.g. New Year Sale" value={title} onChange={(e) => setTitle(e.target.value)} withAsterisk />

        <Flex gap="md">
          <DateTimePicker
            label="Start Date"
            placeholder="Pick date & time"
            value={startDate}
            onChange={setStartDate}
            style={{ flex: 1 }}
            withAsterisk
            clearable
          />
          <DateTimePicker
            label="End Date"
            placeholder="Pick date & time"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || undefined}
            style={{ flex: 1 }}
            withAsterisk
            clearable
          />
        </Flex>

        <Textarea
          label="Content / Description"
          placeholder="Event details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minRows={4}
        />

        <FileInput
          label="Event Images"
          description="Select multiple files (JPG, PNG, WEBP). Max 5MB each."
          placeholder="Click to upload"
          accept="image/png,image/jpeg,image/webp"
          multiple
          leftSection={<IconUpload size={16} />}
          value={files}
          onChange={handleFileChange}
          clearable
        />

        {(existingImages.length > 0 || previews.length > 0) && (
          <Paper withBorder p="sm" radius="md">
            <Text size="xs" c="dimmed" mb="xs">
              {eventToEdit && files.length > 0 ? "Note: Gambar baru akan menggantikan gambar lama." : "Image Previews"}
            </Text>

            <SimpleGrid cols={4} spacing="xs">
              {files.length === 0 &&
                existingImages.map((img) => (
                  <AspectRatio key={img.id} ratio={1 / 1}>
                    <Image src={img.url} radius="sm" fit="cover" alt="Existing" />
                  </AspectRatio>
                ))}

              {previews.map((url, index) => (
                <AspectRatio key={index} ratio={1 / 1}>
                  <Image src={url} radius="sm" fit="cover" alt="New Preview" />
                </AspectRatio>
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
      </Flex>
    </Modal>
  );
};
