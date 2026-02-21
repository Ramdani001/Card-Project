"use client";

import { BannerDto } from "@/types/dtos/BannerDto";
import { AspectRatio, Button, FileInput, Flex, Group, Image, Modal, Paper, Text, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconLink, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface BannerFormProps {
  opened: boolean;
  onClose: () => void;
  bannerToEdit: BannerDto | null;
  onSuccess: () => void;
}

export const BannerForm = ({ opened, onClose, bannerToEdit, onSuccess }: BannerFormProps) => {
  const [loading, setLoading] = useState(false);

  const [link, setLink] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | string | null>(null);
  const [endDate, setEndDate] = useState<Date | string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (bannerToEdit) {
      setStartDate(new Date(bannerToEdit.startDate));
      setEndDate(new Date(bannerToEdit.endDate));
      setLink(bannerToEdit.link || "");
      setPreview(bannerToEdit.url);
      setFile(null);
    } else {
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 3600 * 1000));
      setLink("");
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

    if (new Date(endDate) < new Date(startDate)) {
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
      formData.append("link", link);

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
        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <DateTimePicker
            label="Start Date"
            placeholder="Pick date & time"
            value={startDate instanceof Date ? startDate : null}
            onChange={setStartDate}
            style={{ flex: 1 }}
            withAsterisk
            clearable
          />
          <DateTimePicker
            label="End Date"
            placeholder="Pick date & time"
            value={endDate instanceof Date ? endDate : null}
            onChange={setEndDate}
            minDate={startDate instanceof Date ? startDate : undefined}
            style={{ flex: 1 }}
            withAsterisk
            clearable
          />
        </Flex>

        <TextInput
          label="Redirect Link (Optional)"
          placeholder="https://example.com/promo"
          leftSection={<IconLink size={16} />}
          value={link}
          onChange={(event) => setLink(event.currentTarget.value)}
          description="Arahkan user ke halaman tertentu saat banner diklik."
        />

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
          <Paper withBorder p="sm" radius="md">
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
