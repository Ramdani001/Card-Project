"use client";

import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX, IconCheck } from "@tabler/icons-react";
import { Menu } from "@/types/Menu";

interface MenuFormProps {
  opened: boolean;
  onClose: () => void;
  allMenus: Menu[];
  menuToEdit: Menu | null;
  onSuccess: () => void;
}

export const MenuForm = ({ opened, onClose, allMenus, menuToEdit, onSuccess }: MenuFormProps) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    label: "",
    url: "",
    icon: "",
    order: 0,
    parentCode: null as string | null,
  });

  useEffect(() => {
    if (menuToEdit) {
      setForm({
        code: menuToEdit.code,
        label: menuToEdit.label,
        url: menuToEdit.url || "",
        icon: menuToEdit.icon || "",
        order: menuToEdit.order || 0,
        parentCode: menuToEdit.parentCode || null,
      });
    } else {
      setForm({
        code: "",
        label: "",
        url: "",
        icon: "",
        order: 0,
        parentCode: null,
      });
    }
  }, [menuToEdit, opened]);

  const handleSubmit = async () => {
    if (!form.code) return notifications.show({ title: "Error", message: "Code is required", color: "red", icon: <IconX size={16} /> });
    if (!form.label) return notifications.show({ title: "Error", message: "Label is required", color: "red", icon: <IconX size={16} /> });

    setLoading(true);
    try {
      const isEditing = !!menuToEdit;
      const url = isEditing ? `/api/menus/${menuToEdit.idMenu}` : "/api/menus";
      const method = isEditing ? "PATCH" : "POST";

      const bodyData = {
        code: form.code,
        label: form.label,
        url: form.url.trim() || null,
        icon: form.icon.trim() || null,
        order: form.order,
        parentCode: form.parentCode,
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const json = await res.json();

      if (json.success) {
        notifications.show({ title: "Success", message: json.message, color: "teal", icon: <IconCheck size={16} /> });
        onClose();
        onSuccess();
      } else {
        notifications.show({ title: "Error", message: json.message || "Something went wrong", color: "red", icon: <IconX size={16} /> });
      }
    } catch (error) {
      console.error("Submit error:", error);
      notifications.show({ title: "Error", message: "Unexpected error", color: "red", icon: <IconX size={16} /> });
    } finally {
      setLoading(false);
    }
  };

  const parentOptions = allMenus
    .filter((m) => m.idMenu !== menuToEdit?.idMenu)
    .map((m) => ({
      value: m.code,
      label: `${m.label} (${m.code})`,
    }));

  return (
    <Modal opened={opened} onClose={onClose} title={menuToEdit ? "Edit Menu" : "Add New Menu"} centered size="lg">
      <Stack gap="md">
        <Group grow align="flex-start">
          <TextInput
            label="Menu Code"
            description="Unique ID (e.g. DASHBOARD)"
            placeholder="DASHBOARD"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            withAsterisk
          />
          <TextInput
            label="Label"
            description="Display Name"
            placeholder="Dashboard"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            withAsterisk
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            label="URL Path"
            description="Route path (e.g. /dashboard/users)"
            placeholder="/dashboard/..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <TextInput
            label="Icon Name"
            description="Tabler Icon name (e.g. IconHome)"
            placeholder="IconHome"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
        </Group>

        <Group grow align="flex-start">
          <NumberInput
            label="Order Sequence"
            description="Lower number appears first"
            placeholder="0"
            min={0}
            value={form.order}
            onChange={(val) => setForm({ ...form, order: Number(val) })}
          />

          <Select
            label="Parent Menu"
            description="Leave empty for Root Menu"
            placeholder="Select Parent"
            data={parentOptions}
            value={form.parentCode}
            onChange={(val) => setForm({ ...form, parentCode: val })}
            searchable
            clearable
            nothingFoundMessage="No menu found"
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {menuToEdit ? "Save Changes" : "Create Menu"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
