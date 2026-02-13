import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
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
  const [loading, setLoading] = useState(false);

  const isEditing = !!role;

  useEffect(() => {
    if (role) {
      setName(role.name);
    } else {
      setName("");
    }
  }, [role, opened]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notifications.show({ message: "Role name is required", color: "red" });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/roles/${role.id}` : "/api/roles";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Role" : "Create New Role"} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Role Name"
            placeholder="e.g. SUPER_ADMIN, STAFF"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-autofocus
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
