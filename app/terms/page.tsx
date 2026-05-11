"use client";

import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useCart } from "@/components/hooks/useCart";
import { Alert, Box, Container, Divider, List, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertCircle, IconCards, IconInfoCircle, IconPackage, IconShieldCheck } from "@tabler/icons-react";

export default function ShippingRefundPage() {
  const { cartItems, setCartItems, loadingCart } = useCart();

  return (
    <Box bg="#f8fafc" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="md" py={60}>
        <Stack gap={40}>
          <Box ta="center">
            <Title order={1} fw={900} size="36px" mb="sm">
              Kebijakan Pengiriman & Refund
            </Title>
            <Text c="dimmed" size="lg">
              Informasi lengkap mengenai perubahan pesanan, retur produk, dan jaminan keaslian.
            </Text>
          </Box>

          <Divider />

          <section>
            <Group mb="md">
              <ThemeIcon variant="light" size="xl" color="blue">
                <IconInfoCircle size={24} />
              </ThemeIcon>
              <Title order={2} size="h3">
                Perubahan atau Pembatalan Pesanan
              </Title>
            </Group>
            <Paper p="xl" radius="md" withBorder shadow="sm">
              <Text mb="md">
                Hubungi tim Toko Kartu segera setelah order dibuat. Biasanya tersedia waktu <b>12 jam</b> sebelum pesanan masuk tahap packing.
              </Text>
              <Alert icon={<IconAlertCircle size={16} />} title="Penting: Produk Pre-Order" color="orange" mb="md">
                Kami tidak menerima pembatalan maupun refund untuk produk pre-order. Jika dibatalkan, deposit akan hangus sepenuhnya.
              </Alert>
              <Text size="sm" c="dimmed">
                Untuk perubahan, silakan email ke: <b>admin@toko-kartu.com</b> dengan menyertakan nomor invoice (contoh: INV/2026/...).
              </Text>
            </Paper>
          </section>

          <section>
            <Group mb="md">
              <ThemeIcon variant="light" size="xl" color="teal">
                <IconPackage size={24} />
              </ThemeIcon>
              <Title order={2} size="h3">
                Refund Produk Sealed
              </Title>
            </Group>
            <Paper p="xl" radius="md" withBorder shadow="sm">
              <Text fw={700} mb="xs">
                Syarat Wajib: Video Unboxing
              </Text>
              <Text size="sm" mb="lg">
                Mohon merekam video unboxing dari awal hingga selesai tanpa terputus sebagai bukti utama jika terjadi kerusakan.
              </Text>

              <Title order={4} size="h5" mb="sm">
                Syarat Retur:
              </Title>
              <List spacing="xs" size="sm" icon={<IconShieldCheck size={14} color="green" />}>
                <List.Item>Produk masih 100% tersegel pabrik.</List.Item>
                <List.Item>Kondisi sempurna dan layak jual kembali.</List.Item>
                <List.Item>Menghubungi kami maksimal 48 jam setelah paket diterima.</List.Item>
                <List.Item>Telah disetujui secara tertulis oleh tim Toko Kartu.</List.Item>
              </List>

              <Divider my="lg" label="Biaya & Proses" labelPosition="center" />

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} size="sm" mb="xs">
                    Jika disetujui (Retur Biasa):
                  </Text>
                  <List size="xs" spacing="xs">
                    <List.Item>Ongkir retur ditanggung pembeli.</List.Item>
                    <List.Item>Refund hanya mencakup harga produk.</List.Item>
                    <List.Item>Proses refund 7–14 hari kerja.</List.Item>
                  </List>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} size="sm" mb="xs" c="teal">
                    Jika kesalahan Toko Kartu:
                  </Text>
                  <List size="xs" spacing="xs">
                    <List.Item>Salah kirim atau produk rusak saat pengiriman.</List.Item>
                    <List.Item>Semua biaya retur ditanggung Toko Kartu.</List.Item>
                    <List.Item>Refund penuh termasuk ongkir awal.</List.Item>
                  </List>
                </Grid.Col>
              </Grid>
            </Paper>
          </section>

          <section>
            <Group mb="md">
              <ThemeIcon variant="light" size="xl" color="indigo">
                <IconCards size={24} />
              </ThemeIcon>
              <Title order={2} size="h3">
                Pengajuan Refund Single Card
              </Title>
            </Group>
            <Paper p="xl" radius="md" withBorder shadow="sm">
              <Text size="sm" mb="md">
                Karena harga fluktuatif, kami tidak menerima retur kecuali untuk dua kondisi berikut:
              </Text>

              <Stack gap="md">
                <Box>
                  <Text fw={700} c="indigo">
                    1. Kondisi Kartu Tidak Sesuai
                  </Text>
                  <Text size="sm">
                    Hubungi maksimal 48 jam. Kami akan menawarkan <i>partial refund</i> atau penggantian kartu.
                  </Text>
                </Box>
                <Box>
                  <Text fw={700} c="indigo">
                    2. Barang Salah atau Kurang
                  </Text>
                  <Text size="sm">Kami menanggung seluruh biaya retur, mengirim ulang item, atau refund penuh.</Text>
                </Box>
              </Stack>
            </Paper>
          </section>

          <section>
            <Group mb="md">
              <ThemeIcon variant="light" size="xl" color="red">
                <IconShieldCheck size={24} />
              </ThemeIcon>
              <Title order={2} size="h3">
                Klaim Produk Palsu / Counterfeit
              </Title>
            </Group>
            <Paper p="xl" radius="md" bg="red.0" style={{ borderColor: "var(--mantine-color-red-2)" }} withBorder>
              <Text fw={700} color="red.9" mb="xs">
                Jaminan 100% Original
              </Text>
              <Text size="sm" mb="md">
                Jika kamu menerima kartu palsu dari Toko Kartu, kami akan memberikan <b>refund penuh</b>.
              </Text>
              <Text size="sm">
                Segera hubungi <b>admin@toko-kartu.com</b>. Kami akan menyediakan paket retur prepaid untuk pemeriksaan menyeluruh oleh tim ahli kami.
              </Text>
            </Paper>
          </section>

          <Divider />

          <Text ta="center" size="sm" c="dimmed">
            Punya pertanyaan lain? Hubungi customer service kami pada jam operasional.
            <br />
            <b>Selamat belanja di Toko Kartu!</b>
          </Text>
        </Stack>
      </Container>

      <FooterSection />
    </Box>
  );
}

function Group({ children, mb }: { children: React.ReactNode; mb?: string }) {
  return (
    <Box style={{ display: "flex", alignItems: "center", gap: "12px" }} mb={mb}>
      {children}
    </Box>
  );
}

import { Grid } from "@mantine/core";
