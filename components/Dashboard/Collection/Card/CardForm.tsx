"use client";

import { CardData } from "@/types/CardData";
import { Button, FileInput, Flex, Image, Modal, MultiSelect, NumberInput, Paper, Select, Text, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CardFormProps {
  opened: boolean;
  onClose: () => void;
  cardToEdit: CardData | null;
  onSuccess: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

export const CardForm = ({ opened, onClose, cardToEdit, onSuccess }: CardFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [discountId, setDiscountId] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [discountOptions, setDiscountOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [resCats, resDiscounts] = await Promise.all([
          fetch("/api/categories").then((res) => res.json()),
          fetch("/api/discounts").then((res) => res.json()),
        ]);

        if (resCats.success) {
          setCategoryOptions(resCats.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
        if (resDiscounts.success) {
          setDiscountOptions(
            resDiscounts.data.map((d: any) => ({
              value: d.id,
              label: `${d.name} (${d.type === "PERCENTAGE" ? d.value + "%" : "Rp " + d.value})`,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching master data", error);
        notifications.show({ title: "Error", message: "Failed to load options", color: "red" });
      }
    };

    if (opened) {
      fetchMasters();
    }
  }, [opened]);

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
      setSku(cardToEdit.sku || "");
      setPrice(Number(cardToEdit.price));
      setStock(cardToEdit.stock);
      setDescription(cardToEdit.description || "");

      const selectedCats = cardToEdit.categories.map((c) => c.category.id);
      setCategoryIds(selectedCats);

      setDiscountId(cardToEdit.discountId || null);

      const displayImg = cardToEdit.images.find((img) => img.isPrimary) || cardToEdit.images[0];
      setExistingImage(displayImg?.url || null);

      setFile(null);
      setPreviewImage(null);
    } else {
      setName("");
      setSku("");
      setPrice("");
      setStock("");
      setDescription("");
      setCategoryIds([]);
      setDiscountId(null);
      setFile(null);
      setPreviewImage(null);
      setExistingImage(null);
    }
  }, [cardToEdit, opened]);

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Name required", color: "red" });
    if (price === "" || price === undefined) return notifications.show({ message: "Price required", color: "red" });
    if (stock === "" || stock === undefined) return notifications.show({ message: "Stock required", color: "red" });
    if (categoryIds.length === 0) return notifications.show({ message: "At least one category required", color: "red" });

    const isEditMode = !!cardToEdit;

    if (!isEditMode && !file) {
      return notifications.show({ message: "Image is required for new product", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("description", description);

      categoryIds.forEach((id) => formData.append("categoryIds", id));

      if (discountId) formData.append("discountId", discountId);

      if (file) {
        formData.append("image", file);
      }

      const url = isEditMode ? `/api/cards/${cardToEdit.id}` : "/api/cards";
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

  const handleFileChange = (file: File | null) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={cardToEdit ? "Edit Product" : "Create New Product"} centered size="lg">
      <Flex direction="column" gap="sm">
        <TextInput label="Product Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} withAsterisk />

        <TextInput label="SKU (Stock Keeping Unit)" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />

        <Flex gap="md">
          <NumberInput
            label="Price (IDR)"
            placeholder="0"
            value={price}
            onChange={(val) => setPrice(val === "" ? "" : Number(val))}
            style={{ flex: 1 }}
            withAsterisk
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
          />
          <NumberInput
            label="Stock"
            placeholder="0"
            value={stock}
            onChange={(val) => setStock(val === "" ? "" : Number(val))}
            style={{ flex: 1 }}
            withAsterisk
          />
        </Flex>

        <Flex gap="md">
          <MultiSelect
            label="Categories"
            placeholder="Select Categories"
            data={categoryOptions}
            value={categoryIds}
            onChange={setCategoryIds}
            style={{ flex: 1 }}
            withAsterisk
            searchable
            clearable
          />
          <Select
            label="Discount (Optional)"
            placeholder="Select Discount"
            data={discountOptions}
            value={discountId}
            onChange={setDiscountId}
            style={{ flex: 1 }}
            clearable
            searchable
          />
        </Flex>

        <Textarea
          label="Description"
          placeholder="Product details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
        />

        <FileInput
          label="Product Image"
          description="Max 5MB (JPG, PNG, WEBP)"
          placeholder="Click to upload"
          accept="image/png,image/jpeg,image/webp"
          leftSection={<IconUpload size={16} />}
          clearable
          value={file}
          onChange={handleFileChange}
          withAsterisk={!cardToEdit}
          error={!file && !existingImage && !cardToEdit && "Image is required"}
        />

        {(previewImage || existingImage) && (
          <Paper p="xs" withBorder w="fit-content">
            <Text size="xs" c="dimmed" mb={5}>
              {previewImage ? "New Image Preview" : "Current Image"}
            </Text>
            <Image src={previewImage || existingImage} w={200} h={120} fit="contain" radius="md" alt="Preview" />
          </Paper>
        )}
      </Flex>

      <Flex justify="flex-end" gap="sm" mt="lg">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {cardToEdit ? "Update Product" : "Create Product"}
        </Button>
      </Flex>
    </Modal>
  );
};
