"use client";

import { Button, Flex, Modal, PasswordInput, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Role, User } from "./ListMember";

interface ListMemberFormProps {
  opened: boolean;
  onClose: () => void;
  rolesList: Role[];
  userToEdit: User | null;
  onSuccess: () => void;
}

export const ListMemberForm = ({ opened, onClose, rolesList, userToEdit, onSuccess }: ListMemberFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone || "");
      setRoleId(userToEdit.roleId || null);
      setIsActive(userToEdit.isActive);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRoleId(null);
      setIsActive(true);
    }
  }, [userToEdit, opened]);

  const handleSubmit = async () => {
    if (!email) return notifications.show({ message: "Email is required", color: "red" });
    if (!userToEdit && !password) return notifications.show({ message: "Password is required for new user", color: "red" });

    setLoading(true);
    try {
      const payload: any = {
        name,
        email,
        phone,
        roleId,
        isActive,
      };

      if (password) {
        payload.password = password;
      }

      const isEditMode = !!userToEdit;
      const url = isEditMode ? `/api/users/${userToEdit.id}` : "/api/users";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
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

  const roleOptions = rolesList.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={userToEdit ? "Edit User" : "Create New User"} centered>
      <Flex direction="column" gap="md">
        <TextInput label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />

        <TextInput label="Email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} withAsterisk type="email" />

        <PasswordInput
          label={userToEdit ? "New Password" : "Password"}
          placeholder={userToEdit ? "Leave blank to keep current password" : "********"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          withAsterisk={!userToEdit}
        />

        <TextInput label="Phone Number" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.target.value)} />

        <Select label="Role" placeholder="Select Role" data={roleOptions} value={roleId} onChange={setRoleId} clearable />

        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {userToEdit ? "Update User" : "Create User"}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
