"use client";

import { Role } from "@/types/Role";
import { Button, Divider, Group, Modal, MultiSelect, ScrollArea, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconLockAccess, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { ApiPermissionState, RoleApiAccessTable } from "./RoleApiAccessTable";

interface RoleFormModalProps {
  opened: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export const RoleFormModal = ({ opened, onClose, role, onSuccess }: RoleFormModalProps) => {
  const isEditing = !!role;

  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [apiPermissions, setApiPermissions] = useState<ApiPermissionState[]>([]);

  const [categoriesList, setCategoriesList] = useState<{ value: string; label: string }[]>([]);
  const [menusList, setMenusList] = useState<{ value: string; label: string }[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<{ value: string; label: string }[]>([]);
  const [searchValue, setSearchValue] = useState(""); // Buat logic creatable v7
  const [loading, setLoading] = useState(false);

  const selectData = useMemo(() => {
    const data = [...apiEndpoints];
    const query = searchValue.trim();
    if (query.length > 0 && !data.some((item) => item.value === query)) {
      data.unshift({ value: query, label: `+ Add: ${query}` });
    }
    return data;
  }, [apiEndpoints, searchValue]);

  const fetchAll = async () => {
    try {
      const [cat, menu, api] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/menus").then((r) => r.json()),
        fetch("/api/api-endpoints").then((r) => r.json()),
      ]);

      if (cat.success) setCategoriesList(cat.data.map((c: any) => ({ value: c.id, label: c.name })));
      if (menu.success) setMenusList(menu.data.map((m: any) => ({ value: m.id, label: m.label })));
      if (api.success) setApiEndpoints(api.data.map((e: any) => ({ value: e.url, label: e.url })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (opened) {
      fetchAll();
      if (role) {
        setName(role.name);

        const categoryIds = (role.cardCategoryRoleAccesses || []).map((a: any) => a.category.id).filter(Boolean);
        const menuIds = (role.roleMenuAccesses || []).map((a: any) => a.menuId).filter(Boolean);
        setSelectedCategories(categoryIds);
        setSelectedMenus(menuIds);
        setApiPermissions(
          role.roleApiAccesses?.map((a) => ({
            url: a.apiEndpoints.url,
            canRead: a.canRead,
            canCreate: a.canCreate,
            canUpdate: a.canUpdate,
            canDelete: a.canDelete,
          })) || []
        );
      } else {
        setName("");
        setSelectedCategories([]);
        setSelectedMenus([]);
        setApiPermissions([]);
      }
    }
  }, [opened, role]);

  const handleAddApi = (url: string) => {
    if (!apiPermissions.find((p) => p.url === url)) {
      setApiPermissions([{ url, canRead: true, canCreate: false, canUpdate: false, canDelete: false }, ...apiPermissions]);
    }
    setSearchValue("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/roles/${role.id}` : "/api/roles";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryIds: selectedCategories,
          menuIds: selectedMenus,
          apiAccesses: apiPermissions,
        }),
      });

      const json = await res.json();
      if (json.success) {
        notifications.show({ title: "Success", message: json.message, color: "teal", icon: <IconCheck size={16} /> });
        onSuccess();
        onClose();
      } else {
        notifications.show({ title: "Error", message: json.message, color: "red", icon: <IconX size={16} /> });
      }
    } catch (e) {
      console.error(e);
      notifications.show({ title: "Error", message: "Network error", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Role" : "Tambah Role"}
      size="xl"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <form onSubmit={handleSave}>
        <Stack gap="md">
          <TextInput label="Role Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <Group grow>
            <MultiSelect label="Category Access" data={categoriesList} value={selectedCategories} onChange={setSelectedCategories} searchable />
            <MultiSelect label="Menu Access" data={menusList} value={selectedMenus} onChange={setSelectedMenus} searchable />
          </Group>

          <Divider
            label={
              <Group gap={4} mt={40}>
                <IconLockAccess size={14} /> API ACCESS MATRIX
              </Group>
            }
            labelPosition="center"
          />

          <Select
            label="Search or insert API"
            placeholder="/api/products"
            data={selectData}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onChange={(val) => val && handleAddApi(val)}
            value={null}
            nothingFoundMessage="Add"
            leftSection={<IconPlus size={16} />}
          />

          <RoleApiAccessTable
            value={apiPermissions}
            onChange={setApiPermissions}
            onRemove={(url) => setApiPermissions((prev) => prev.filter((p) => p.url !== url))}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Role
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
