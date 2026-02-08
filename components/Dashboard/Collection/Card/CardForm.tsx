"use client";

import { CardData } from "@/types/CardData";
import { Button, FileInput, Flex, Image, Modal, NumberInput, Paper, Select, Text, Textarea, TextInput } from "@mantine/core";
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

  // State Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [idTypeCard, setIdTypeCard] = useState<string | null>(null);
  const [idDiscount, setIdDiscount] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [typeCardOptions, setTypeCardOptions] = useState<SelectOption[]>([]);
  const [discountOptions, setDiscountOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [resTypes, resDiscounts] = await Promise.all([
          fetch("/api/type-cards").then((res) => res.json()),
          fetch("/api/discounts").then((res) => res.json()),
        ]);

        if (resTypes.success) {
          setTypeCardOptions(resTypes.data.map((t: any) => ({ value: String(t.idTypeCard), label: t.name })));
        }
        if (resDiscounts.success) {
          setDiscountOptions(resDiscounts.data.map((d: any) => ({ value: String(d.idDiscount), label: `${d.discount}% - ${d.note || ""}` })));
        }
      } catch (error) {
        console.error("Error fetching master data", error);
      }
    };

    if (opened) {
      fetchMasters();
    }
  }, [opened]);

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.detail?.name || "");
      setPrice(cardToEdit.detail?.price || 0);
      setStock(cardToEdit.detail?.stock || 0);
      setNote(cardToEdit.detail?.note || "");
      setIdTypeCard(cardToEdit.typeCard?.idTypeCard ? String(cardToEdit.typeCard.idTypeCard) : null);
      setIdDiscount(cardToEdit.detail?.discount?.idDiscount ? String(cardToEdit.detail.discount.idDiscount) : null);

      setExistingImage(cardToEdit.detail?.image?.location || null);

      setFile(null);
      setPreviewImage(null);
    } else {
      setName("");
      setPrice("");
      setStock("");
      setNote("");
      setIdTypeCard(null);
      setIdDiscount(null);
      setFile(null);
      setPreviewImage(null);
      setExistingImage(null);
    }
  }, [cardToEdit, opened]);

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Name required", color: "red" });
    if (price === "" || price === undefined) return notifications.show({ message: "Price required", color: "red" });
    if (stock === "" || stock === undefined) return notifications.show({ message: "Stock required", color: "red" });
    if (!idTypeCard) return notifications.show({ message: "Type Card required", color: "red" });

    const isEditMode = !!cardToEdit;
    if (!isEditMode && !file) {
      return notifications.show({ message: "Image is required for new card", color: "red" });
    }
    if (isEditMode && !existingImage && !file) {
      return notifications.show({ message: "Image is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("idTypeCard", idTypeCard);
      formData.append("note", note);
      formData.append("idDiscount", idDiscount || "");

      if (file) {
        formData.append("image", file);
      }

      const url = isEditMode ? `/api/cards/${cardToEdit.idCard}` : "/api/cards";
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
    <Modal opened={opened} onClose={onClose} title={cardToEdit ? "Edit Card" : "Create New Card"} centered size="lg">
      <TextInput label="Card Name" placeholder="e.g. Platinum Member" value={name} onChange={(e) => setName(e.target.value)} mb="sm" withAsterisk />

      <Flex gap="md" mb="sm">
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

      <Flex gap="md" mb="sm">
        <Select
          label="Type Card"
          placeholder="Select Type"
          data={typeCardOptions}
          value={idTypeCard}
          onChange={setIdTypeCard}
          style={{ flex: 1 }}
          withAsterisk
          searchable
        />
        <Select
          label="Discount (Optional)"
          placeholder="Select Discount"
          data={discountOptions}
          value={idDiscount}
          onChange={setIdDiscount}
          style={{ flex: 1 }}
          clearable
          searchable
        />
      </Flex>

      <Textarea label="Note" placeholder="Additional notes..." value={note} onChange={(e) => setNote(e.target.value)} minRows={2} mb="md" />

      <FileInput
        label="Card Image"
        description="Max 5MB (JPG, PNG, WEBP)"
        placeholder="Click to upload"
        accept="image/png,image/jpeg,image/webp"
        leftSection={<IconUpload size={16} />}
        clearable
        value={file}
        onChange={handleFileChange}
        mb="md"
        withAsterisk
        error={!file && !existingImage && "Image is required"}
      />

      {(previewImage || existingImage) && (
        <Paper p="xs" withBorder mb="lg" w="fit-content">
          <Text size="xs" c="dimmed" mb={5}>
            {previewImage ? "New Image Preview" : "Current Image"}
          </Text>
          <Image src={previewImage || existingImage} w={200} h={120} fit="contain" radius="md" alt="Preview" />
        </Paper>
      )}

      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {cardToEdit ? "Update Card" : "Create Card"}
        </Button>
      </Flex>
    </Modal>
  );
};
