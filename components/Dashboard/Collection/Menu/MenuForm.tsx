"use client";

import { Menu } from "@/types/Menu";
import { Button, Flex, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface MenuFormProps {
  opened: boolean;
  onClose: () => void;
  menuToEdit: Menu | null;
  allMenus: Menu[];
  onSuccess: () => void;
}

export const MenuForm = ({ opened, onClose, menuToEdit, allMenus, onSuccess }: MenuFormProps) => {
  const [loading, setLoading] = useState(false);

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (menuToEdit) {
      setLabel(menuToEdit.label);
      setUrl(menuToEdit.url || "");
      setIcon(menuToEdit.icon || "");
      setOrder(menuToEdit.order);
      setParentId(menuToEdit.parentId || null);
    } else {
      setLabel("");
      setUrl("");
      setIcon("");
      setOrder("");
      setParentId(null);
    }
  }, [menuToEdit, opened]);

  const parentOptions = allMenus
    .filter((m) => m.id !== menuToEdit?.id)
    .map((m) => ({
      value: m.id,
      label: `${m.label} (Order: ${m.order})`,
    }));

  const handleSubmit = async () => {
    if (!label) return notifications.show({ message: "Label is required", color: "red" });
    if (order === "" || order === undefined) return notifications.show({ message: "Order is required", color: "red" });

    setLoading(true);
    try {
      const payload = {
        label,
        url: url || null,
        icon: icon || null,
        order: Number(order),
        parentId: parentId || null,
      };

      const isEditMode = !!menuToEdit;
      const apiUrl = isEditMode ? `/api/menus/${menuToEdit.id}` : "/api/menus";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(apiUrl, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <Modal opened={opened} onClose={onClose} title={menuToEdit ? "Edit Menu" : "Add New Menu"} centered>
      <Flex direction="column" gap="md">
        <TextInput
          label="Label Name"
          placeholder="e.g. Dashboard"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          withAsterisk
          data-autofocus
        />

        <TextInput
          label="URL Path"
          placeholder="e.g. /dashboard"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          description="Leave empty if this is a parent menu without link"
        />

        <Flex gap="md">
          <TextInput
            label="Icon Name"
            placeholder="e.g. IconHome"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={{ flex: 1 }}
            description="Tabler Icon name"
          />
          <NumberInput
            label="Order"
            placeholder="0"
            value={order}
            onChange={(val) => setOrder(val === "" ? "" : Number(val))}
            style={{ width: 100 }}
            withAsterisk
            min={0}
          />
        </Flex>

        <Select
          label="Parent Menu (Optional)"
          placeholder="Select Parent or Leave as Root"
          data={parentOptions}
          value={parentId}
          onChange={setParentId}
          clearable
          searchable
        />

        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {menuToEdit ? "Update" : "Create"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
