"use client";

import { Button, Group, Modal, MultiSelect, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Role } from "./ListRole";

interface RoleFormModalProps {
  opened: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export const RoleFormModal = ({ opened, onClose, role, onSuccess }: RoleFormModalProps) => {
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [fetchingMenus, setFetchingMenus] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [menusList, setMenusList] = useState<{ value: string; label: string }[]>([]);

  const isEditing = !!role;

  const fetchMenus = async () => {
    setFetchingMenus(true);
    try {
      const res = await fetch("/api/menus");
      const json = await res.json();
      if (json.success) {
        setMenusList(json.data.map((m: any) => ({ value: m.id, label: m.label })));
      }
    } catch (error) {
      console.error("Gagal mengambil menu:", error);
    } finally {
      setFetchingMenus(false);
    }
  };

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategoriesList(json.data.map((c: any) => ({ value: c.id, label: c.name })));
      }
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    } finally {
      setFetchingCategories(false);
    }
  };

  // Panggil fetch saat modal pertama kali dibuka
  useEffect(() => {
    if (opened) {
      fetchCategories();
      fetchMenus();
    }
  }, [opened]);

  useEffect(() => {
    if (role && opened) {
      setName(role.name);

      // Ambil ID Category dari relasi cardCategoryRoleAccesses
      const categoryIds = role.cardCategoryRoleAccesses?.map((a: any) => a.categoryId || a.category?.id) || [];
      // Ambil ID Menu dari relasi roleMenuAccesses
      const menuIds = role.roleMenuAccesses?.map((a: any) => a.menuId || a.menu?.id) || [];

      setSelectedCategories(categoryIds);
      setSelectedMenus(menuIds);
    } else if (!isEditing) {
      setName("");
      setSelectedCategories([]);
      setSelectedMenus([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return notifications.show({ message: "Role name is required", color: "red" });

    setLoading(true);
    try {
      const url = isEditing ? `/api/roles/${role.id}` : "/api/roles";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryIds: selectedCategories,
          menuIds: selectedMenus,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Success",
          message: isEditing ? "Role updated successfully" : "Role created successfully",
          color: "green",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(json.message || "Something went wrong");
      }
    } catch (error: any) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Role" : "Create New Role"} centered size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput label="Role Name" placeholder="e.g. SUPER_ADMIN, STAFF" value={name} onChange={(e) => setName(e.target.value)} required />

          <MultiSelect
            label="Category Access"
            placeholder={fetchingCategories ? "Loading categories..." : "Select categories"}
            data={categoriesList}
            value={selectedCategories}
            onChange={setSelectedCategories}
            searchable
            clearable
            nothingFoundMessage="No categories found"
            disabled={fetchingCategories}
          />

          <MultiSelect
            label="Menu Access"
            placeholder={fetchingMenus ? "Loading menus..." : "Select menus"} // Typo fixed
            data={menusList}
            value={selectedMenus}
            onChange={setSelectedMenus}
            searchable
            clearable
            nothingFoundMessage="No menus found"
            disabled={fetchingMenus}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="blue">
              {isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
