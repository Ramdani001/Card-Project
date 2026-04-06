"use client";

import { DiscountTypeDto } from "@/types/dtos/DiscountDto";
import { VoucherDto } from "@/types/dtos/VoucherDto";
import { SelectOption } from "@/types/SelectOption";
import { Button, Flex, Modal, MultiSelect, NumberInput, SegmentedControl, Text, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface VoucherFormProps {
  opened: boolean;
  onClose: () => void;
  voucherToEdit: VoucherDto | null;
  onSuccess: () => void;
}

export const VoucherForm = ({ opened, onClose, voucherToEdit, onSuccess }: VoucherFormProps) => {
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DiscountTypeDto>("NOMINAL");
  const [value, setValue] = useState<number | string>(0);
  const [minPurchase, setMinPurchase] = useState<number | string>("");
  const [maxDiscount, setMaxDiscount] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const [startDate, setStartDate] = useState<Date | null | string>(new Date());
  const [endDate, setEndDate] = useState<Date | null | string>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [cardOptions, setCardOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (voucherToEdit) {
      setCode(voucherToEdit.code);
      setName(voucherToEdit.name);
      setDescription(voucherToEdit.description || "");
      setType(voucherToEdit.type);
      setValue(Number(voucherToEdit.value));
      setMinPurchase(voucherToEdit.minPurchase ? Number(voucherToEdit.minPurchase) : "");
      setMaxDiscount(voucherToEdit.maxDiscount ? Number(voucherToEdit.maxDiscount) : "");
      setStock(voucherToEdit.stock ? Number(voucherToEdit.stock) : "");
      setStartDate(new Date(voucherToEdit.startDate));
      setEndDate(new Date(voucherToEdit.endDate));

      setSelectedRoles(voucherToEdit.voucherRoles?.map((r: any) => r.roleId) || []);
      setSelectedCards(voucherToEdit.voucherCards?.map((c: any) => c.cardId) || []);
      setSelectedCategories(voucherToEdit.voucherCardCategories?.map((cat: any) => cat.cardCategoryId) || []);
    } else {
      resetForm();
    }
  }, [voucherToEdit, opened]);

  const resetForm = () => {
    setCode("");
    setName("");
    setDescription("");
    setType("NOMINAL");
    setValue(0);
    setMinPurchase("");
    setMaxDiscount("");
    setStock("");
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setSelectedRoles([]);
    setSelectedCards([]);
    setSelectedCategories([]);
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [resCats, resCards, resRoles] = await Promise.all([
          fetch("/api/categories").then((res) => res.json()),
          fetch("/api/cards").then((res) => res.json()),
          fetch("/api/roles").then((res) => res.json()),
        ]);

        if (resCats.success) {
          setCategoryOptions(resCats.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
        if (resCards.success) {
          setCardOptions(
            resCards.data.map((d: any) => ({
              value: d.id,
              label: d.name,
            }))
          );
        }
        if (resRoles.success) {
          setRoleOptions(
            resRoles.data.map((d: any) => ({
              value: d.id,
              label: d.name,
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

  const handleSubmit = async () => {
    if (!code || !name || !startDate || !endDate || !value) {
      return notifications.show({ message: "Please fill required fields", color: "red" });
    }

    setLoading(true);
    try {
      const payload = {
        code,
        name,
        description,
        type,
        value: Number(value),
        minPurchase: minPurchase ? Number(minPurchase) : undefined,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        stock: stock ? Number(stock) : undefined,
        startDate,
        endDate,
        voucherRoles: selectedRoles.map((id) => ({ roleId: id })),
        voucherCards: selectedCards.map((id) => ({ cardId: id })),
        voucherCardCategories: selectedCategories.map((id) => ({ cardCategoryId: id })),
      };

      const url = voucherToEdit ? `/api/vouchers/${voucherToEdit.id}` : "/api/vouchers";
      const method = voucherToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        notifications.show({ title: "Success", message: json.message, color: "teal", icon: <IconCheck size={16} /> });
        onSuccess();
        onClose();
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
      }
    } catch {
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={voucherToEdit ? "Edit Voucher" : "Create New Voucher"} centered size={"lg"}>
      <Flex direction="column" gap="md">
        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <TextInput
            label="Voucher Code"
            placeholder="e.g. SALE2026"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            withAsterisk
            style={{ flex: 1 }}
            disabled={!!voucherToEdit}
          />
          <TextInput
            label="Voucher Name"
            placeholder="Promotion Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            withAsterisk
            style={{ flex: 2 }}
          />
        </Flex>

        <Textarea
          label="Description"
          placeholder="Optional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={2}
        />

        <Flex gap="md" direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500} mb={3}>
              Discount Type
            </Text>
            <SegmentedControl
              value={type}
              onChange={(v) => setType(v as DiscountTypeDto)}
              data={[
                { label: "Fixed (Rp)", value: "NOMINAL" },
                { label: "Percentage (%)", value: "PERCENTAGE" },
              ]}
              fullWidth
            />
          </div>
          <NumberInput
            label="Discount Value"
            value={value}
            onChange={setValue}
            withAsterisk
            min={0}
            max={type === "PERCENTAGE" ? 100 : undefined}
            style={{ flex: 1 }}
            leftSection={type === "NOMINAL" ? "Rp" : undefined}
            rightSection={type === "PERCENTAGE" ? "%" : undefined}
          />
        </Flex>

        <MultiSelect
          label="Limit to Roles"
          placeholder="Select roles"
          data={roleOptions}
          value={selectedRoles}
          onChange={setSelectedRoles}
          searchable
          clearable
        />

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <MultiSelect
            label="Specific Cards"
            placeholder="Select cards"
            data={cardOptions}
            value={selectedCards}
            onChange={setSelectedCards}
            style={{ flex: 1 }}
          />
          <MultiSelect
            label="Specific Categories"
            placeholder="Select categories"
            data={categoryOptions}
            value={selectedCategories}
            onChange={setSelectedCategories}
            style={{ flex: 1 }}
          />
        </Flex>

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <NumberInput label="Min. Purchase" value={minPurchase} onChange={setMinPurchase} min={0} style={{ flex: 1 }} leftSection="Rp" />
          {type === "PERCENTAGE" && (
            <NumberInput label="Max. Discount" value={maxDiscount} onChange={setMaxDiscount} min={0} style={{ flex: 1 }} leftSection="Rp" />
          )}
        </Flex>

        <Flex gap="md" direction={{ base: "column", sm: "row" }}>
          <NumberInput label="Stock / Quota" placeholder="Unlimited" value={stock} onChange={setStock} min={0} style={{ flex: 1 }} />
          <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} withAsterisk style={{ flex: 1 }} />
        </Flex>

        <DateTimePicker label="End Date" value={endDate} onChange={setEndDate} withAsterisk minDate={startDate || undefined} />

        <Flex justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {voucherToEdit ? "Update Voucher" : "Create Voucher"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
