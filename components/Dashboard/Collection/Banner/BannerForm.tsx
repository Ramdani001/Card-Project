"use client";

import { AspectRatio, Button, FileInput, Flex, Image, Modal, Paper, Text, Group } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export interface Banner {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  url: string;
}

interface BannerFormProps {
  opened: boolean;
  onClose: () => void;
  bannerToEdit: Banner | null;
  onSuccess: () => void;
}

export const BannerForm = ({ opened, onClose, bannerToEdit, onSuccess }: BannerFormProps) => {
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState<Date | string | null>(null);
  const [endDate, setEndDate] = useState<Date | string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (bannerToEdit) {
      setStartDate(new Date(bannerToEdit.startDate));
      setEndDate(new Date(bannerToEdit.endDate));
      setPreview(bannerToEdit.url);
      setFile(null);
    } else {
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 3600 * 1000));
      setFile(null);
      setPreview(null);
    }
  }, [bannerToEdit, opened]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setPreview(URL.createObjectURL(newFile));
    } else {
      if (bannerToEdit) {
        setPreview(bannerToEdit.url);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      return notifications.show({ message: "Start and End date required", color: "red" });
    }

    if (endDate < startDate) {
      return notifications.show({ message: "End date must be after Start date", color: "red" });
    }

    if (!file && !bannerToEdit) {
      return notifications.show({ message: "Banner image is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());

      if (file) {
        formData.append("file", file);
      }

      const isEditMode = !!bannerToEdit;
      const url = isEditMode ? `/api/banners/${bannerToEdit.id}` : "/api/banners";
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
        onSuccess();
        onClose();
      } else {
        notifications.show({
          title: "Error",
          message: json.message,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={bannerToEdit ? "Edit Banner" : "Upload New Banner"} centered size="md">
      <Flex direction="column" gap="md">
        {/* Input Tanggal */}
        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
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

        <FileInput
          label="Banner Image"
          description="Select a file (JPG, PNG, WEBP). Max 5MB."
          placeholder="Click to upload"
          accept="image/png,image/jpeg,image/webp"
          leftSection={<IconUpload size={16} />}
          value={file}
          onChange={handleFileChange}
          clearable
          withAsterisk={!bannerToEdit}
        />

        {preview && (
          <Paper withBorder p="sm" bg="gray.0" radius="md">
            <Text size="xs" c="dimmed" mb="xs">
              {bannerToEdit && file ? "New Image Preview (Will replace old one)" : "Preview"}
            </Text>

            <AspectRatio ratio={16 / 9}>
              <Image src={preview} radius="sm" fit="cover" alt="Banner Preview" fallbackSrc="https://placehold.co/600x400?text=No+Image" />
            </AspectRatio>
          </Paper>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {bannerToEdit ? "Save Changes" : "Upload Banner"}
          </Button>
        </Group>
      </Flex>
    </Modal>
  );
};
