"use client";

import { FooterSection } from "@/components/LandingPage/FooterSection";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useCart } from "@/components/hooks/useCart";
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Accordion,
  ThemeIcon,
  Divider,
  Alert,
  SimpleGrid,
  Group,
  Badge,
} from "@mantine/core";
import {
  IconWorld,
  IconShieldCheck,
  IconStar,
  IconPackage,
  IconClock,
  IconCards,
  IconBox,
  IconPackageExport,
  IconHeadset,
  IconTruck,
  IconMapPin,
  IconPhone,
  IconBuildingStore,
} from "@tabler/icons-react";

const produkList = [
  {
    value: "single-card",
    icon: IconStar,
    color: "blue",
    title: "Single Card",
    desc: "Dari berbagai rarity, mulai dari common hingga kartu langka/kolektor.",
  },
  {
    value: "booster",
    icon: IconPackage,
    color: "grape",
    title: "Booster Box & Booster Pack",
    desc: "Produk resmi rilisan terbaru maupun rilisan sebelumnya.",
  },
  {
    value: "preorder",
    icon: IconClock,
    color: "orange",
    title: "Pre-Order",
    desc: "Untuk produk rilisan baru yang belum tersedia di pasaran.",
  },
  {
    value: "aksesoris",
    icon: IconCards,
    color: "teal",
    title: "Aksesoris TCG",
    desc: "Sleeve, deck box, binder, playmat, dan perlengkapan lainnya.",
  },
  {
    value: "case-box",
    icon: IconBox,
    color: "gray",
    title: "Case & Box",
    desc: "Penyimpanan dan perlindungan koleksi kartu Anda.",
  },
];

const komitmenList = [
  {
    icon: IconShieldCheck,
    title: "100% Produk Original",
    desc: "Bukan replika maupun bootleg.",
  },
  {
    icon: IconPackageExport,
    title: "Pengemasan Aman",
    desc: "Menjaga kondisi kartu selama proses pengiriman.",
  },
  {
    icon: IconHeadset,
    title: "Layanan Responsif",
    desc: "Membantu setiap transaksi pelanggan.",
  },
  {
    icon: IconTruck,
    title: "Pengiriman Nasional",
    desc: "Menjangkau ke seluruh Indonesia.",
  },
];

export default function AboutUsPage() {
  const { cartItems, setCartItems, loadingCart } = useCart();

  return (
    <Box bg="#f8fafc" mih="100vh">
      <HeaderSection cartItems={cartItems} loadingCart={loadingCart} setCartItems={setCartItems} />

      <Container size="md" py={60}>
        <Stack gap={40}>
          <Box ta="center">
            <Title order={1} fw={900} size="36px" mb="sm">
              Tentang Kami
            </Title>
            <Text c="dimmed" size="lg">
              Platform belanja online resmi milik Arnero Card Game Store untuk kolektor dan pemain TCG di seluruh Indonesia.
            </Text>
          </Box>

          <Divider />

          {/* Cerita Kami */}
          <Paper p="xl" radius="md" withBorder shadow="sm" bg="blue.0" style={{ borderColor: "var(--mantine-color-blue-2)" }}>
            <Group mb="md">
              <ThemeIcon color="blue" size="lg" radius="md">
                <IconWorld size={20} />
              </ThemeIcon>
              <Title order={2} size="h4">
                Arnero Card Game Store, sejak 2022
              </Title>
            </Group>

            <Text size="sm" mb="md">
              Toko Kartu merupakan platform belanja online resmi milik <b>Arnero Card Game Store</b>, yang dioperasikan oleh{" "}
              <b>PT Arnero Kreasi Multi Jaya</b>. Berawal dari komunitas pecinta Trading Card Game (TCG) sejak tahun 2022 dengan nama
              Arnero, kami terus berkembang hingga akhirnya menghadirkan Toko Kartu sebagai platform resmi untuk melayani kebutuhan
              kolektor dan pemain TCG di seluruh Indonesia secara lebih luas.
            </Text>

            <Text size="sm" mb="md">
              Kami berfokus pada penjualan kartu TCG original, mulai dari Pokémon TCG, One Piece Card Game, hingga Yu-Gi-Oh, baik dalam
              bentuk booster box, booster pack, maupun single card, lengkap dengan berbagai aksesoris pendukung seperti sleeve, deck box,
              binder, dan playmat.
            </Text>

            <Alert color="blue" title="Jaminan Keaslian" icon={<IconShieldCheck size={16} />}>
              <Text size="xs">
                Setiap kolektor dan pemain memiliki kebutuhan berbeda — melengkapi koleksi pribadi, mencari kartu langka, atau
                menyiapkan deck kompetisi. Karena itu, seluruh produk kami <b>dijamin 100% original</b> dan diperoleh dari
                distributor/sumber resmi.
              </Text>
            </Alert>
          </Paper>

          {/* Produk & Layanan */}
          <Box>
            <Title order={2} size="h3" mb={4}>
              Produk & Layanan Kami
            </Title>
            <Text c="dimmed" size="sm" mb="md">
              Semua kebutuhan koleksi dan kompetisi TCG Anda, dalam satu tempat.
            </Text>

            <Accordion variant="separated" radius="md" defaultValue="single-card">
              {produkList.map((p) => (
                <Accordion.Item key={p.value} value={p.value}>
                  <Accordion.Control icon={<p.icon size={20} color={`var(--mantine-color-${p.color}-6)`} />}>
                    {p.title}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text size="sm">{p.desc}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Box>

          {/* Komitmen Kami */}
          <Box>
            <Title order={2} size="h3" mb={4}>
              Komitmen Kami
            </Title>
            <Text c="dimmed" size="sm" mb="md">
              Standar layanan yang kami jaga di setiap transaksi.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {komitmenList.map((k) => (
                <Paper key={k.title} p="lg" radius="md" withBorder shadow="sm">
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
                      <k.icon size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="sm" mb={2}>
                        {k.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {k.desc}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Box>

          {/* Informasi Badan Usaha */}
          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Group mb="md">
              <ThemeIcon color="gray" variant="light" size="lg" radius="md">
                <IconBuildingStore size={20} />
              </ThemeIcon>
              <Box>
                <Title order={2} size="h4">
                  PT Arnero Kreasi Multi Jaya
                </Title>
                <Badge color="blue" variant="light" mt={4}>
                  Arnero Card Game Store
                </Badge>
              </Box>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
              <Group align="flex-start" wrap="nowrap">
                <IconMapPin size={18} color="var(--mantine-color-blue-6)" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text size="sm">
                  Jl. Letjen Sutoyo, RT.001/RW.12, Mojosongo, Kec. Jebres, Kota Surakarta, Jawa Tengah 57136
                </Text>
              </Group>
              <Group align="flex-start" wrap="nowrap">
                <IconPhone size={18} color="var(--mantine-color-blue-6)" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text size="sm">+62 822-5733-6150</Text>
              </Group>
            </SimpleGrid>

            <Divider mb="md" />

            <Text size="sm" c="dimmed">
              Toko Kartu hadir sebagai teman perjalanan Anda di dunia TCG — baik Anda seorang kolektor, pemain kompetitif, maupun yang
              baru memulai hobi ini. Terima kasih telah mempercayakan koleksi dan kebutuhan bermain Anda kepada kami.
            </Text>
          </Paper>
        </Stack>
      </Container>

      <FooterSection />
    </Box>
  );
}
