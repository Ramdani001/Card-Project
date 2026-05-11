"use client";

import { RoleDto } from "@/types/dtos/RoleDto";
import { UserDto } from "@/types/dtos/UserDto";
import { Avatar, Button, FileInput, Flex, Group, Modal, PasswordInput, Select, Stack, Textarea, TextInput } from "@mantine/core";
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

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); // State baru
  const [roleId, setRoleId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [preview, setPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (opened) {
      setName(userToEdit?.name || "");
      setEmail(userToEdit?.email || "");
      setPhone(userToEdit?.phone || "");
      setAddress(userToEdit?.address || "");
      setRoleId(userToEdit?.role?.id || null);
      setFacebookUrl(userToEdit?.facebookUrl || "");
      setInstagramUrl(userToEdit?.instagramUrl || "");
      setTwitterUrl(userToEdit?.twitterUrl || "");
      setPassword("");
      setFile(null);
      setPreview(userToEdit?.avatar || "");
    }
  }, [userToEdit, opened]);

  useEffect(() => {
    if (!file) {
      setPreview(userToEdit?.avatar || "");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, userToEdit]);

  const handleSubmit = async () => {
    if (!email) return notifications.show({ message: "Email is required", color: "red" });
    if (!userToEdit && !password) return notifications.show({ message: "Password is required for new user", color: "red" });

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("facebookUrl", facebookUrl);
      formData.append("instagramUrl", instagramUrl);
      formData.append("twitterUrl", twitterUrl);

      if (roleId) formData.append("roleId", roleId);
      if (password.trim()) formData.append("password", password);
      if (file) formData.append("file", file);

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
    <Modal opened={opened} onClose={onClose} title={userToEdit ? "Edit User" : "Create New User"} centered size="lg">
      <Stack gap="md">
        <Group justify="center">
          <Avatar src={preview} size={100} radius="100%" style={{ border: "2px solid #eee" }} />
        </Group>

        <Group grow>
          <TextInput label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput label="Email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} withAsterisk />
        </Group>

        <Group grow>
          <PasswordInput
            label={userToEdit ? "Change Password" : "Password"}
            placeholder={userToEdit ? "Leave blank to keep current" : "********"}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            withAsterisk={!userToEdit}
          />
          <TextInput label="Phone Number" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
        </Group>

        <Textarea
          label="Address"
          placeholder="Enter complete address..."
          value={address}
          onChange={(e) => setAddress(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <Group grow>
          <TextInput
            label="Facebook URL"
            placeholder="https://facebook.com/..."
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.currentTarget.value)}
          />
          <TextInput
            label="Instagram URL"
            placeholder="https://instagram.com/..."
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.currentTarget.value)}
          />
        </Group>

        <TextInput
          label="Twitter (X) URL"
          placeholder="https://twitter.com/..."
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.currentTarget.value)}
        />

        <Group grow>
          <FileInput
            label="Profile Picture"
            placeholder="Choose image"
            leftSection={<IconPhoto size={16} />}
            value={file}
            onChange={setFile}
            accept="image/png,image/jpeg,image/webp"
            clearable
          />
          <Select label="Role" placeholder="Select Role" data={roleOptions} value={roleId} onChange={setRoleId} clearable />
        </Group>

        <Flex justify="flex-end" gap="sm" mt="xl">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} color="indigo">
            {userToEdit ? "Update User" : "Create User"}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
};
