"use client";

import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useCart } from "@/components/hooks/useCart";
import { Box, Container, Title, Text, Stack, Paper, Accordion, ThemeIcon, Divider, Alert, List, Group } from "@mantine/core";
import { IconTruckDelivery, IconWorld, IconPackageOff, IconMapPinSearch, IconAlertCircle, IconMail, IconReceipt2 } from "@tabler/icons-react";

export default function ShippingPolicyPage() {
  const { cartItems, setCartItems, loadingCart } = useCart();

  return (
    <Box bg="#f8fafc" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="md" py={60}>
        <Stack gap={40}>
          <Box ta="center">
            <Title order={1} fw={900} size="36px" mb="sm">
              Kebijakan Pengiriman
            </Title>
            <Text c="dimmed" size="lg">
              Segala hal yang perlu kamu ketahui tentang pengiriman domestik, internasional, dan penanganan kendala paket.
            </Text>
          </Box>

          <Divider />

          <Paper p="xl" radius="md" withBorder shadow="sm" bg="blue.0" style={{ borderColor: "var(--mantine-color-blue-2)" }}>
            <Group mb="md">
              <ThemeIcon color="blue" size="lg" radius="md">
                <IconWorld size={20} />
              </ThemeIcon>
              <Title order={2} size="h4">
                Bea Cukai, Pajak, dan Biaya Tambahan
              </Title>
            </Group>
            <Text size="sm" mb="md">
              Toko Kartu tidak bertanggung jawab atas biaya customs clearance, pajak impor, atau biaya tambahan lainnya yang mungkin dikenakan oleh
              pihak bea cukai di negara tujuan.
            </Text>
            <Alert color="blue" title="Tanggung Jawab Pembeli" icon={<IconReceipt2 size={16} />}>
              <Text size="xs">
                Harga di website hanya mencakup <b>Harga Produk</b> dan <b>Biaya Pengiriman</b>. Biaya impor/customs sepenuhnya menjadi tanggung jawab
                pembeli.
              </Text>
            </Alert>
          </Paper>

          <Accordion variant="separated" radius="md" defaultValue="estimasi">
            <Accordion.Item value="estimasi">
              <Accordion.Control icon={<IconTruckDelivery size={20} color="var(--mantine-color-teal-6)" />}>
                Estimasi Waktu & Status Pengiriman
              </Accordion.Control>
              <Accordion.Panel>
                <List spacing="xs" size="sm" mb="md">
                  <List.Item>
                    <b>Domestik:</b> 2–7 hari kerja.
                  </List.Item>
                  <List.Item>
                    <b>Internasional:</b> 7–21 hari kerja.
                  </List.Item>
                  <List.Item>Hari kerja: Senin–Jumat (tidak termasuk hari libur/akhir pekan).</List.Item>
                </List>
                <Text size="xs" c="dimmed">
                  Catatan: Jika status tracking sudah menunjukkan “Shipped”, kami tidak dapat memberikan refund apabila pembeli mengaku belum menerima
                  paket.
                </Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="kendala">
              <Accordion.Control icon={<IconMapPinSearch size={20} color="var(--mantine-color-orange-6)" />}>
                Paket Tidak Bergerak, Delay, atau Hilang
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" fw={700} mb="xs">
                  Langkah yang harus kamu lakukan:
                </Text>
                <List size="sm" spacing="xs" mb="lg">
                  <List.Item>Pastikan alamat sudah benar.</List.Item>
                  <List.Item>Cek percobaan pengiriman dari kurir atau tetangga/keluarga.</List.Item>
                  <List.Item>Hubungi kantor pos atau pihak customs setempat.</List.Item>
                  <List.Item>
                    Jika status &quot;Shipped&quot; tapi paket belum ada, tunggu hingga 36 jam karena update sistem terkadang lebih cepat dari fisik
                    paket.
                  </List.Item>
                </List>
                <Text size="sm">
                  Jika tetap tidak ditemukan, email ke <b>admin@toko-kartu.com</b> untuk investigasi ekspedisi.
                </Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="returns">
              <Accordion.Control icon={<IconPackageOff size={20} color="var(--mantine-color-red-6)" />}>
                Paket Gagal Dikirim & Kembali ke Kami
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" mb="md">
                  Refund akan diproses setelah barang kami terima kembali.
                </Text>
                <Alert color="red" title="Potongan Biaya" icon={<IconAlertCircle size={16} />}>
                  <Text size="xs">
                    Jika gagal karena <b>alamat salah, menolak bayar pajak customs, atau paket ditolak penerima</b>, maka biaya handling dan ongkir
                    akan dipotong dari total refund.
                  </Text>
                </Alert>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="no-tracking">
              <Accordion.Control icon={<IconMail size={20} color="var(--mantine-color-gray-6)" />}>Paket Tanpa Fitur Tracking</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" mb="md">
                  Jangan panik. Lakukan verifikasi alamat dan cek ke kantor pos lokal. Jika paket dinyatakan hilang oleh ekspedisi, kami dapat
                  membantu proses refund.
                </Text>
                <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                  Jika paket tiba setelah refund diberikan, mohon hubungi kami untuk pengaturan pembayaran ulang atau pengembalian paket.
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Paper p="xl" radius="md" withBorder ta="center" bg="gray.0">
            <Text size="sm" mb="xs">
              Masih butuh bantuan terkait pengiriman?
            </Text>
            <Text fw={700} size="lg" c="blue">
              admin@toko-kartu.com
            </Text>
            <Text size="xs" c="dimmed" mt="sm">
              Sertakan nomor invoice agar tim kami bisa mengecek status pesananmu lebih cepat.
            </Text>
          </Paper>
        </Stack>
      </Container>

      <FooterSection />
    </Box>
  );
}
