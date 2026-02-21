import { Box, Image, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Autoplay, EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Banner } from "@/components/Dashboard/Collection/Banner/BannerForm";

export const SwiperCard = () => {
  const [Banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners/active");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBanners(json.data);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.error("Error fetch banners:", error);
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
    return <Skeleton w="100%" radius={8} style={{ aspectRatio: "16 / 9" }} animate={true} />;
  }

  if (Banners.length === 0) {
    return null;
  }

  return (
    <Box w="100%">
      <Swiper
        grabCursor={true}
        effect={"creative"}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        creativeEffect={{
          prev: {
            shadow: true,
            translate: [0, 0, -400],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        }}
        modules={[Autoplay, EffectCreative]}
        className="mySwiper"
      >
        {Banners.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <Box
              w="100%"
              style={{
                aspectRatio: "16 / 9",
                position: "relative",
                overflow: "hidden",
                borderRadius: 8,
              }}
              bg={"#ffff"}
            >
              <Image src={item.url} fit="contain" w="100%" h="100%" style={{ position: "absolute", top: 0, left: 0 }} alt={`Banner ${index + 1}`} />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
