"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Modal, PasswordInput, Select, TextInput } from "@mantine/core";
import { Role } from "@/app/types/Role";
import { UserData } from "@/app/types/UserData";
import { notifications } from "@mantine/notifications";
import { IconX, IconCheck } from "@tabler/icons-react";

interface ListMemberFormProps {
  opened: boolean;
  onClose: () => void;
  rolesList: Role[];
  userToEdit: UserData | null;
  onSuccess: () => void;
}

export const ListMemberForm = ({ opened, onClose, rolesList, userToEdit, onSuccess }: ListMemberFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    idRole: "",
  });

  const showError = (message: string) => {
    notifications.show({
      title: "Error",
      message: message,
      color: "red",
      icon: <IconX size={16} />,
    });
  };

  const showSuccess = (message: string) => {
    notifications.show({
      title: "Success",
      message: message,
      color: "teal",
      icon: <IconCheck size={16} />,
    });
  };

  useEffect(() => {
    if (userToEdit) {
      setForm({
        email: userToEdit.email,
        password: "",
        idRole: userToEdit.role?.idRole.toString() || "",
      });
    } else {
      setForm({
        email: "",
        password: "",
        idRole: "",
      });
    }
  }, [userToEdit, opened]);

  const handleSubmit = async () => {
    if (!form.email) return alert("Email required");
    if (!userToEdit && !form.password) return alert("Password required");
    if (!form.idRole) return alert("Role required");

    setLoading(true);
    try {
      const isEditing = !!userToEdit;
      const url = isEditing ? `/api/users/${userToEdit.idUsr}` : "/api/users";
      const method = isEditing ? "PATCH" : "POST";

      const bodyData: any = {
        email: form.email,
        idRole: Number(form.idRole),
      };

      if (form.password) bodyData.password = form.password;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const json = await res.json();

      if (json.success) {
        showSuccess(json.message);
        onClose();
        onSuccess();
      } else {
        showError(json.message || "Something went wrong with the server");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={userToEdit ? "Edit User" : "Add New User"} centered>
      <TextInput
        label="Email"
        placeholder="user@example.com"
        value={form.email}
        type="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        mb="md"
      />

      <PasswordInput
        label="Password"
        placeholder={userToEdit ? "Leave blank to keep current" : "Enter password"}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        mb="md"
      />

      <Select
        label="Role"
        placeholder="Select Role"
        data={rolesList.map((role) => ({
          value: role.idRole.toString(),
          label: role.name,
        }))}
        value={form.idRole}
        onChange={(val) => setForm({ ...form, idRole: val || "" })}
        mb="lg"
        searchable
        nothingFoundMessage="Role not found"
      />

      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {userToEdit ? "Save Changes" : "Create User"}
        </Button>
      </Flex>
    </Modal>
  );
};
