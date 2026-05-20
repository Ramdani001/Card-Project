"use client";

import { CardDto } from "@/types/dtos/CardDto";
import { SelectOption } from "@/types/SelectOption";
import {
  ActionIcon,
  Box,
  Button,
  FileInput,
  Flex,
  Image,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrash, IconUpload, IconX, IconStar, IconStarFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CardFormProps {
  opened: boolean;
  onClose: () => void;
  cardToEdit: CardDto | null;
  onSuccess: () => void;
}

interface PreviewFile {
  id: string;
  url: string;
  file: File;
}

interface ExistingImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export const CardForm = ({ opened, onClose, cardToEdit, onSuccess }: CardFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [minQtyPurchase, setMinQtyPurchase] = useState<number | "">("");
  const [maxQtyPurchase, setMaxQtyPurchase] = useState<number | "">("");

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [discountId, setDiscountId] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<PreviewFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);

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
    newPreviews.forEach((p) => URL.revokeObjectURL(p.url));

    if (cardToEdit) {
      setName(cardToEdit.name);
      setSku(cardToEdit.sku || "");
      setPrice(Number(cardToEdit.price));
      setStock(cardToEdit.stock);
      setDescription(cardToEdit.description || "");
      setMinQtyPurchase(cardToEdit.minQtyPurchase ?? "");
      if (cardToEdit.maxQtyPurchase !== undefined && cardToEdit.maxQtyPurchase !== null) {
        setMaxQtyPurchase(cardToEdit.maxQtyPurchase);
      }

      const selectedCats = cardToEdit.categories.map((c) => c.category.id);
      setCategoryIds(selectedCats);
      setDiscountId(cardToEdit.discountId || null);

      const mappedImages = cardToEdit.images.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
      }));
      setExistingImages(mappedImages);

      const primary = mappedImages.find((img) => img.isPrimary);
      setPrimaryImageId(primary ? primary.id : mappedImages[0]?.id || null);

      setFiles([]);
      setNewPreviews([]);
      setImagesToDelete([]);
    } else {
      setName("");
      setSku("");
      setPrice("");
      setStock("");
      setDescription("");
      setCategoryIds([]);
      setDiscountId(null);
      setFiles([]);
      setNewPreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      setMinQtyPurchase("");
      setPrimaryImageId(null);
      if (maxQtyPurchase !== undefined && maxQtyPurchase !== null) {
        setMaxQtyPurchase("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardToEdit, opened]);

  const handleFilesChange = (selectedFiles: File[]) => {
    newPreviews.forEach((p) => URL.revokeObjectURL(p.url));

    setFiles(selectedFiles);

    if (selectedFiles.length > 0) {
      const previews = selectedFiles.map((file, idx) => {
        const generatedId = `new_file_${idx}_${Date.now()}`;
        return {
          id: generatedId,
          file,
          url: URL.createObjectURL(file),
        };
      });
      setNewPreviews(previews);

      if (!cardToEdit || existingImages.filter((img) => !imagesToDelete.includes(img.id)).length === 0) {
        if (!primaryImageId || !previews.some((p) => p.id === primaryImageId)) {
          setPrimaryImageId(previews[0].id);
        }
      }
    } else {
      setNewPreviews([]);
      if (!cardToEdit) setPrimaryImageId(null);
    }
  };

  const handleRemoveNewFile = (idToRemove: string) => {
    const previewToRemove = newPreviews.find((p) => p.id === idToRemove);
    if (previewToRemove) URL.revokeObjectURL(previewToRemove.url);

    const updatedPreviews = newPreviews.filter((p) => p.id !== idToRemove);
    setNewPreviews(updatedPreviews);
    setFiles(updatedPreviews.map((p) => p.file));

    if (primaryImageId === idToRemove) {
      const remainingExisting = existingImages.filter((img) => !imagesToDelete.includes(img.id));
      if (remainingExisting.length > 0) {
        setPrimaryImageId(remainingExisting[0].id);
      } else if (updatedPreviews.length > 0) {
        setPrimaryImageId(updatedPreviews[0].id);
      } else {
        setPrimaryImageId(null);
      }
    }
  };

  const handleToggleDeleteExisting = (id: string) => {
    let updatedDeleteList: string[];

    if (imagesToDelete.includes(id)) {
      updatedDeleteList = imagesToDelete.filter((item) => item !== id);
    } else {
      updatedDeleteList = [...imagesToDelete, id];
    }

    setImagesToDelete(updatedDeleteList);

    if (primaryImageId === id && updatedDeleteList.includes(id)) {
      const remainingExisting = existingImages.filter((img) => !updatedDeleteList.includes(img.id));
      if (remainingExisting.length > 0) {
        setPrimaryImageId(remainingExisting[0].id);
      } else if (newPreviews.length > 0) {
        setPrimaryImageId(newPreviews[0].id);
      } else {
        setPrimaryImageId(null);
      }
    }
  };

  const handleSetPrimary = (id: string) => {
    setPrimaryImageId(id);
  };

  const handleSubmit = async () => {
    if (!name) return notifications.show({ message: "Name required", color: "red" });
    if (price === "" || price === undefined) return notifications.show({ message: "Price required", color: "red" });
    if (stock === "" || stock === undefined) return notifications.show({ message: "Stock required", color: "red" });
    if (categoryIds.length === 0) return notifications.show({ message: "At least one category required", color: "red" });

    const isEditMode = !!cardToEdit;

    const remainingExistingImagesCount = existingImages.filter((img) => !imagesToDelete.includes(img.id)).length;

    if (files.length === 0 && remainingExistingImagesCount === 0) {
      return notifications.show({ message: "At least one image is required for the card", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("description", description);

      if (minQtyPurchase !== "") formData.append("minQtyPurchase", String(minQtyPurchase));
      if (maxQtyPurchase !== "") formData.append("maxQtyPurchase", String(maxQtyPurchase));

      categoryIds.forEach((id) => formData.append("categoryIds", id));
      if (discountId) formData.append("discountId", discountId);

      newPreviews.forEach((preview, index) => {
        formData.append("images", preview.file);
        if (primaryImageId === preview.id) {
          formData.append("primaryImageIndex", String(index));
        }
      });

      if (isEditMode) {
        existingImages
          .filter((img) => !imagesToDelete.includes(img.id))
          .forEach((img) => {
            formData.append("keepImageIds", img.id);
          });

        if (primaryImageId && !primaryImageId.startsWith("new_file_")) {
          formData.append("primaryImageId", primaryImageId);
        }
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

  return (
    <Modal opened={opened} onClose={onClose} title={cardToEdit ? "Edit Card" : "Create New Card"} centered size={"lg"}>
      <Flex direction="column" gap="sm">
        <TextInput label="Card Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} withAsterisk />

        <TextInput label="SKU (Stock Keeping Unit)" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
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

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <NumberInput
            label="Min. Purchase Qty"
            placeholder="Optional"
            value={minQtyPurchase}
            onChange={(val) => setMinQtyPurchase(val === "" ? "" : Number(val))}
            style={{ flex: 1 }}
            min={1}
          />
          <NumberInput
            label="Max. Purchase Qty"
            placeholder="Optional"
            value={maxQtyPurchase}
            onChange={(val) => setMaxQtyPurchase(val === "" ? "" : Number(val))}
            style={{ flex: 1 }}
            min={1}
          />
        </Flex>

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
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
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autosize
          minRows={5}
          maxRows={15}
        />

        <FileInput
          label="Card Images"
          description="You can upload multiple files. Max 5MB per image (JPG, PNG, WEBP)"
          placeholder="Click to upload images"
          accept="image/png,image/jpeg,image/webp"
          leftSection={<IconUpload size={16} />}
          multiple
          value={files}
          onChange={handleFilesChange}
          withAsterisk={!cardToEdit}
        />

        {cardToEdit && existingImages.length > 0 && (
          <Box>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              {existingImages.map((img) => {
                const isMarkedForDelete = imagesToDelete.includes(img.id);
                const isPrimary = primaryImageId === img.id;
                return (
                  <Paper
                    key={img.id}
                    p="xs"
                    withBorder
                    style={{
                      position: "relative",
                      opacity: isMarkedForDelete ? 0.4 : 1,
                      backgroundColor: isMarkedForDelete ? "#fff5f5" : isPrimary ? "#f0f7ff" : "transparent",
                      borderColor: isPrimary ? "#3b5bdb" : "#e9ecef",
                    }}
                  >
                    <Image src={img.url} h={90} fit="contain" radius="sm" alt="Existing Aset" />
                    <Flex justify="space-between" align="center" mt={5}>
                      <ActionIcon size="xs" variant="subtle" color="yellow" disabled={isMarkedForDelete} onClick={() => handleSetPrimary(img.id)}>
                        {isPrimary ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                      </ActionIcon>
                      <ActionIcon
                        size="xs"
                        color={isMarkedForDelete ? "blue" : "red"}
                        variant="light"
                        onClick={() => handleToggleDeleteExisting(img.id)}
                      >
                        {isMarkedForDelete ? (
                          <Text size="10px" fw={600}>
                            Keep
                          </Text>
                        ) : (
                          <IconTrash size={12} />
                        )}
                      </ActionIcon>
                    </Flex>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Box>
        )}

        {newPreviews.length > 0 && (
          <Box mt="xs">
            <Text size="xs" fw={500} mb={5} c="teal">
              New Images to Upload ({newPreviews.length}):
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              {newPreviews.map((preview) => {
                const isPrimary = primaryImageId === preview.id;
                return (
                  <Paper
                    key={preview.id}
                    p="xs"
                    withBorder
                    style={{
                      position: "relative",
                      backgroundColor: isPrimary ? "#f0f7ff" : "transparent",
                      borderColor: isPrimary ? "#3b5bdb" : "#e9ecef",
                    }}
                  >
                    <Image src={preview.url} h={90} fit="contain" radius="sm" alt="Preview Baru" />
                    <Flex justify="space-between" align="center" mt={5}>
                      <ActionIcon size="xs" variant="subtle" color="yellow" onClick={() => handleSetPrimary(preview.id)}>
                        {isPrimary ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                      </ActionIcon>
                      <ActionIcon size="xs" color="red" variant="subtle" onClick={() => handleRemoveNewFile(preview.id)}>
                        <IconX size={14} />
                      </ActionIcon>
                    </Flex>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Box>
        )}
      </Flex>

      <Flex justify="flex-end" gap="sm" mt="lg">
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
