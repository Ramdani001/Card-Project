"use client";
import { Box, Container, Image, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Autoplay, EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { BannerDto } from "@/types/dtos/BannerDto";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/effect-creative";

export const SwiperCard = () => {
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners/active");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBanners(json.data);
        }
      } catch {
        notifications.show({
          title: "Error",
          message: "Gagal mengambil data banners.",
          color: "red",
        });
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchBanners();
  }, []);

  if (loadingBanners) {
    return (
      <Container size="xl" my="md">
        <Skeleton w="100%" radius="md" style={{ aspectRatio: "16 / 9" }} />
      </Container>
    );
  }

  if (banners.length === 0) return null;

  const handleNavigation = (link?: string) => {
    if (!link) return;
    if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      router.push(link);
    }
  };

  return (
    <Container fluid my="md">
      <Box w="100%" style={{ borderRadius: 8, overflow: "hidden" }}>
        <Swiper
          grabCursor={true}
          effect="creative"
          loop={banners.length > 1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          creativeEffect={{
            prev: { shadow: true, translate: [0, 0, -400] },
            next: { translate: ["100%", 0, 0] },
          }}
          modules={[Autoplay, EffectCreative]}
        >
          {banners.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <Box
                onClick={() => handleNavigation(item.link)}
                style={{
                  aspectRatio: "16 / 9",
                  cursor: item.link ? "pointer" : "default",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={item.url} alt={`Banner ${index + 1}`} fit="contain" w="100%" h="100%" />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Container>
  );
};
