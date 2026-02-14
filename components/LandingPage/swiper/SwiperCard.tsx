import React, { useEffect, useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';

// import required modules
import { EffectCreative } from 'swiper/modules';
import { Box, Image } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Banner } from '@/components/Dashboard/Collection/Banner/BannerForm';


export const SwiperCard = () => {

  const [Banners, setBanners] = useState<Banner[]>([]);
        const [loadingBanners, setLoadingBanners] = useState(true);
  
      useEffect(() => {
          const fetchBanners = async () => {
            try {
              const res = await fetch("/api/banners");
              const json = await res.json();
              if (json.success && Array.isArray(json.data)) {
                setBanners(json.data);
              } else {
                setBanners([]);
              }
            } catch (error) {
              console.error("Error fetch banners:", error);
              notifications.show({ title: "Error", message: "Gagal mengambil data banners.", color: "red" });
            } finally {
              setLoadingBanners(false);
            }
          };
          console.log(fetchBanners());
        }, []);
  return (
    <>
      <Swiper
        grabCursor={true}
        effect={'creative'}
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
            translate: ['100%', 0, 0],
          },
        }}
        modules={[Autoplay, EffectCreative]}
        className="mySwiper"
      >
        {Banners
              .map((item) => (
                   <SwiperSlide>
                      <Box
                        w="100%"
                        style={{
                          aspectRatio: '16 / 9',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 8,
                        }}
                        bg={"#ffff"}
                      >
                        <Image
                          src={item.url}
                          fit="contain"    // agar tidak terpotong
                          w="100%"
                          h="100%"
                          style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                      </Box>


                  </SwiperSlide>
              ))
          }
      </Swiper>
    </>
  );
};
