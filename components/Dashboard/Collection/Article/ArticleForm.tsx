"use client";

import { ArticleDto } from "@/types/dtos/ArticleDto";
import { AspectRatio, Box, Button, Divider, FileInput, Flex, Image, Modal, Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Link, RichTextEditor } from "@mantine/tiptap";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ArticleFormProps {
  opened: boolean;
  onClose: () => void;
  articleToEdit: ArticleDto | null;
  onSuccess: () => void;
}

export const ArticleForm = ({ opened, onClose, articleToEdit, onSuccess }: ArticleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, TextAlign.configure({ types: ["heading", "paragraph"] })],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      editor?.commands.setContent(articleToEdit.content || "");
      setExistingImages(articleToEdit.images || []);
      setFiles([]);
      setPreviews([]);
    } else {
      setTitle("");
      editor?.commands.setContent("");
      setFiles([]);
      setPreviews([]);
      setExistingImages([]);
    }
  }, [articleToEdit, opened, editor]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    const content = editor?.getHTML();

    if (!title) return notifications.show({ message: "Title is required", color: "red" });
    if (!content || content === "<p></p>") return notifications.show({ message: "Content is required", color: "red" });

    const totalImages = existingImages.length + files.length;
    if (totalImages === 0) {
      return notifications.show({ message: "At least one image is required", color: "red" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      files.forEach((file) => {
        formData.append("images", file);
      });

      const isEditMode = !!articleToEdit;
      const url = isEditMode ? `/api/articles/${articleToEdit.id}` : "/api/articles";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {articleToEdit ? "Edit Article" : "Write New Article"}
        </Text>
      }
      centered
      size="90%"
      padding="xl"
    >
      <Stack gap="lg">
        <Stack gap="xs">
          <TextInput
            label="Article Title"
            placeholder="Enter a compelling title..."
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            withAsterisk
            size="md"
          />

          <Text size="sm" fw={500} mb={-10}>
            Content
          </Text>

          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={0}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content mih={300} />
          </RichTextEditor>
        </Stack>

        <Divider label="Media Gallery" labelPosition="center" />

        <Stack gap="xs">
          <FileInput
            label="Article Images"
            description="Select multiple images"
            placeholder="Upload images"
            accept="image/*"
            multiple
            leftSection={<IconUpload size={16} />}
            value={files}
            onChange={handleFileChange}
          />

          {(existingImages.length > 0 || previews.length > 0) && (
            <Paper withBorder p="md" radius="md">
              <SimpleGrid cols={{ base: 2, sm: 4, md: 6 }} spacing="sm">
                {files.length === 0 &&
                  existingImages.map((img) => (
                    <Box key={img.id} pos="relative">
                      <AspectRatio ratio={1 / 1}>
                        <Image alt={"Images"} src={img.url} radius="md" fit="cover" />
                      </AspectRatio>
                    </Box>
                  ))}

                {previews.map((url, index) => (
                  <Box key={index} pos="relative">
                    <AspectRatio ratio={1 / 1}>
                      <Image alt={"Images"} src={url} radius="md" fit="cover" />
                    </AspectRatio>
                  </Box>
                ))}
              </SimpleGrid>
            </Paper>
          )}
        </Stack>

        <Flex justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Discard
          </Button>
          <Button size="md" px="xl" onClick={handleSubmit} loading={loading}>
            {articleToEdit ? "Save Changes" : "Publish Article"}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
};
