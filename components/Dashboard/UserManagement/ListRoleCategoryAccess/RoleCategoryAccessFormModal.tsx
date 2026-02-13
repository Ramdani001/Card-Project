import { Button, Group, Modal, Select, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { RoleCategoryAccess } from "./ListRoleCategoryAccess";

interface RoleCategoryAccessFormModalProps {
  opened: boolean;
  onClose: () => void;
  access: RoleCategoryAccess | null;
  onSuccess: () => void;
}

export const RoleCategoryAccessFormModal = ({ opened, onClose, access, onSuccess }: RoleCategoryAccessFormModalProps) => {
  const [roleId, setRoleId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [rolesOption, setRolesOption] = useState<{ value: string; label: string }[]>([]);
  const [categoriesOption, setCategoriesOption] = useState<{ value: string; label: string }[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  const isEditing = !!access;

  useEffect(() => {
    const fetchOptions = async () => {
      setFetchingOptions(true);
      try {
        const resRoles = await fetch("/api/roles?limit=100");
        const jsonRoles = await resRoles.json();
        if (jsonRoles.success) {
          setRolesOption(jsonRoles.data.map((r: any) => ({ value: r.id, label: r.name })));
        }

        const resCategories = await fetch("/api/categories?limit=100");
        const jsonCategories = await resCategories.json();
        if (jsonCategories.success) {
          setCategoriesOption(jsonCategories.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setFetchingOptions(false);
      }
    };

    if (opened) {
      fetchOptions();
    }
  }, [opened]);

  useEffect(() => {
    if (access) {
      setRoleId(access.roleId);
      setCategoryId(access.categoryId);
      setIsActive(access.isActive);
    } else {
      setRoleId(null);
      setCategoryId(null);
      setIsActive(true);
    }
  }, [access, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleId || !categoryId) {
      notifications.show({ message: "Role and Category are required", color: "red" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const url = isEditing ? `/api/role-category-access/${access.id}` : "/api/role-category-access";
      const method = isEditing ? "PATCH" : "POST";

      const payload = isEditing ? { roleId, categoryId, isActive } : { roleId, categoryId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Success",
          message: isEditing ? "Access updated successfully" : "Access assigned successfully",
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
      setLoadingSubmit(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Access" : "Assign Role Access"} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Select Role"
            placeholder="Choose role..."
            data={rolesOption}
            value={roleId}
            onChange={setRoleId}
            searchable
            disabled={fetchingOptions}
            required
          />

          <Select
            label="Select Category"
            placeholder="Choose category..."
            data={categoriesOption}
            value={categoryId}
            onChange={setCategoryId}
            searchable
            disabled={fetchingOptions}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loadingSubmit}>
              Cancel
            </Button>
            <Button type="submit" loading={loadingSubmit} color="blue">
              {isEditing ? "Save Changes" : "Assign Access"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
