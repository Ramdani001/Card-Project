"use client";

import { RoleDto } from "@/types/dtos/RoleDto";
import { UserDto } from "@/types/dtos/UserDto";
import { Avatar, Button, FileInput, Flex, Group, Modal, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPhoto, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ListMemberFormProps {
  opened: boolean;
  onClose: () => void;
  rolesList: RoleDto[];
  userToEdit: UserDto | null;
  onSuccess: () => void;
}

export const ListMemberForm = ({ opened, onClose, rolesList, userToEdit, onSuccess }: ListMemberFormProps) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const imagePreview = file ? URL.createObjectURL(file) : userToEdit?.avatar;

  useEffect(() => {
    if (opened) {
      setName(userToEdit?.name || "");
      setEmail(userToEdit?.email || "");
      setPhone(userToEdit?.phone || "");
      setRoleId(userToEdit?.role?.id || null);
      setFacebookUrl(userToEdit?.facebookUrl || "");
      setInstagramUrl(userToEdit?.instagramUrl || "");
      setTwitterUrl(userToEdit?.twitterUrl || "");
      setPassword("");
      setFile(null);
    }
  }, [userToEdit, opened]);

  const handleSubmit = async () => {
    if (!email) return notifications.show({ message: "Email is required", color: "red" });
    if (!userToEdit && !password) return notifications.show({ message: "Password is required for new user", color: "red" });

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("facebookUrl", facebookUrl);
      formData.append("instagramUrl", instagramUrl);
      formData.append("twitterUrl", twitterUrl);

      if (roleId) formData.append("roleId", roleId);

      if (password.trim()) {
        formData.append("password", password);
      }

      if (file) {
        formData.append("file", file);
      }

      const isEditMode = !!userToEdit;
      const url = isEditMode ? `/api/users/${userToEdit.id}` : "/api/users";

      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        notifications.show({
          title: "Success",
          message: json.message || "Operation successful",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        onClose();
        onSuccess();
      } else {
        throw new Error(json.message || "Something went wrong");
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Network error",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = rolesList.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={userToEdit ? "Edit User" : "Create New User"} centered size="md">
      <Stack gap="md">
        {imagePreview && (
          <Group justify="center">
            <Avatar src={imagePreview} size="xl" radius="xl" />
          </Group>
        )}

        <TextInput label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.currentTarget.value)} />

        <TextInput label="Email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} withAsterisk />

        <PasswordInput
          label={userToEdit ? "Change Password" : "Password"}
          placeholder={userToEdit ? "Leave blank to keep current" : "********"}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          withAsterisk={!userToEdit}
        />

        <TextInput label="Phone Number" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />

        <Group grow>
          <TextInput
            label="Facebook"
            placeholder="https://facebook.com/..."
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.currentTarget.value)}
          />
          <TextInput
            label="Instagram"
            placeholder="https://instagram.com/..."
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.currentTarget.value)}
          />
        </Group>

        <TextInput
          label="Twitter (X)"
          placeholder="https://twitter.com/..."
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.currentTarget.value)}
        />

        <FileInput
          label="Profile Picture"
          placeholder={file ? file.name : "Choose image"}
          leftSection={<IconPhoto size={16} />}
          value={file}
          onChange={setFile}
          accept="image/png,image/jpeg,image/webp"
          clearable
        />

        <Select label="Role" placeholder="Select Role" data={roleOptions} value={roleId} onChange={setRoleId} clearable />

        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {userToEdit ? "Save Changes" : "Create User"}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
};
