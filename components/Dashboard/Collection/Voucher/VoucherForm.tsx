"use client";

import { DiscountTypeDto } from "@/types/dtos/DiscountDto";
import { VoucherDto } from "@/types/dtos/VoucherDto";
import { Button, Flex, Modal, NumberInput, SegmentedControl, Text, Textarea, TextInput } from "@mantine/core";
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

  // States
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DiscountTypeDto>("NOMINAL");
  const [value, setValue] = useState<number | string>(0);

  const [minPurchase, setMinPurchase] = useState<number | string>("");
  const [maxDiscount, setMaxDiscount] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");

  const [startDate, setStartDate] = useState<Date | string | null>(new Date());
  const [endDate, setEndDate] = useState<Date | string | null>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

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
  };

  const handleSubmit = async () => {
    if (!code || !name || !startDate || !endDate || !value) {
      return notifications.show({ message: "Please fill required fields", color: "red" });
    }

    if (type === "PERCENTAGE" && Number(value) > 100) {
      return notifications.show({ message: "Percentage cannot exceed 100%", color: "red" });
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
    <Modal opened={opened} onClose={onClose} title={voucherToEdit ? "Edit Voucher" : "Create New Voucher"} centered size="lg">
      <Flex direction="column" gap="md">
        <Flex gap="md">
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

        <Flex gap="md" align="flex-end">
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500} mb={3}>
              Discount Type
            </Text>
            <SegmentedControl
              value={type}
              onChange={(v) => setType(v as "NOMINAL" | "PERCENTAGE")}
              data={[
                { label: "Fixed (Rp)", value: "NOMINAL" },
                { label: "Percentage (%)", value: "PERCENTAGE" },
              ]}
              fullWidth
            />
          </div>
          <NumberInput
            label="Discount Value"
            placeholder="0"
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

        <Flex gap="md">
          <NumberInput
            label="Min. Purchase"
            description="Minimum transaction to use"
            placeholder="Optional"
            value={minPurchase}
            onChange={setMinPurchase}
            min={0}
            style={{ flex: 1 }}
            leftSection="Rp"
          />
          {type === "PERCENTAGE" && (
            <NumberInput
              label="Max. Discount"
              description="Max cap for % discount"
              placeholder="Optional"
              value={maxDiscount}
              onChange={setMaxDiscount}
              min={0}
              style={{ flex: 1 }}
              leftSection="Rp"
            />
          )}
        </Flex>

        <Flex gap="md">
          <NumberInput
            label="Stock / Quota"
            description="Leave empty for unlimited"
            placeholder="Unlimited"
            value={stock}
            onChange={setStock}
            min={0}
            style={{ flex: 1 }}
          />
          <div style={{ flex: 1 }}></div>
        </Flex>

        <Flex gap="md">
          <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} withAsterisk style={{ flex: 1 }} clearable />
          <DateTimePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            withAsterisk
            style={{ flex: 1 }}
            clearable
            minDate={startDate || undefined}
          />
        </Flex>

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
