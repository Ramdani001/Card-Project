import { Box, Button, Checkbox, Divider, Group, Loader, Modal, ScrollArea, Select, SimpleGrid, Stack, Text } from "@mantine/core";
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fetchingAccess, setFetchingAccess] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  const [rolesOption, setRolesOption] = useState<{ value: string; label: string }[]>([]);
  const [categoriesOption, setCategoriesOption] = useState<{ value: string; label: string }[]>([]);

  const isEditing = !!access;

  useEffect(() => {
    if (!opened) return;

    const fetchOptions = async () => {
      setFetchingOptions(true);
      try {
        const [resRoles, resCategories] = await Promise.all([fetch("/api/roles?limit=100"), fetch("/api/categories?limit=100")]);

        const jsonRoles = await resRoles.json();
        const jsonCategories = await resCategories.json();

        if (jsonRoles.success) {
          setRolesOption(jsonRoles.data.map((r: any) => ({ value: r.id, label: r.name })));
        }
        if (jsonCategories.success) {
          setCategoriesOption(jsonCategories.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchOptions();
  }, [opened]);

  useEffect(() => {
    if (!opened) return;

    const currentRoleId = access ? access.roleId : roleId;

    if (access) {
      setRoleId(access.roleId);
    } else if (!access && !roleId) {
      setSelectedCategories([]);
    }

    if (currentRoleId) {
      fetchCurrentAccess(currentRoleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, opened]);

  const fetchCurrentAccess = async (selectedRoleId: string) => {
    setFetchingAccess(true);
    try {
      const res = await fetch(`/api/role-category-access?roleId=${selectedRoleId}&limit=1000`);
      const json = await res.json();
      if (json.success) {
        const activeIds = json.data.map((item: any) => item.categoryId);
        setSelectedCategories(activeIds);
      }
    } catch (error) {
      console.error("Failed to fetch active access", error);
    } finally {
      setFetchingAccess(false);
    }
  };

  const handleRoleChange = (value: string | null) => {
    setRoleId(value);
    if (value) {
      fetchCurrentAccess(value);
    } else {
      setSelectedCategories([]);
    }
  };

  const allCategoriesSelected = selectedCategories.length === categoriesOption.length && categoriesOption.length > 0;
  const indeterminate = selectedCategories.length > 0 && !allCategoriesSelected;

  const handleSelectAll = () => {
    if (allCategoriesSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categoriesOption.map((cat) => cat.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleId) {
      notifications.show({ message: "Please select a Role first", color: "red" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch(`/api/roles/${roleId}/category-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, categoryIds: selectedCategories }),
      });

      const json = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Success",
          message: "Role access synchronized successfully",
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
    <Modal opened={opened} onClose={onClose} title="Manage Role Access" centered size="lg">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Select Role"
            placeholder="Choose role..."
            data={rolesOption}
            value={roleId}
            onChange={handleRoleChange}
            searchable
            disabled={fetchingOptions || isEditing}
            required
          />

          <Box>
            <Text size="sm" fw={500} mb={8}>
              Assign Categories
            </Text>

            {fetchingAccess ? (
              <Group gap="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading access data...
                </Text>
              </Group>
            ) : (
              <Box p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                <Checkbox
                  label={allCategoriesSelected ? "Deselect All" : "Select All"}
                  checked={allCategoriesSelected}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                  disabled={categoriesOption.length === 0}
                  fw={500}
                />

                <Divider my="sm" />

                <ScrollArea h={300} type="auto" offsetScrollbars>
                  <Checkbox.Group value={selectedCategories} onChange={setSelectedCategories}>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {categoriesOption.map((cat) => (
                        <Checkbox key={cat.value} value={cat.value} label={cat.label} />
                      ))}
                    </SimpleGrid>
                  </Checkbox.Group>

                  {categoriesOption.length === 0 && !fetchingOptions && (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No categories found.
                    </Text>
                  )}
                </ScrollArea>
              </Box>
            )}
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loadingSubmit}>
              Cancel
            </Button>
            <Button type="submit" loading={loadingSubmit} color="blue">
              Save Access
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
