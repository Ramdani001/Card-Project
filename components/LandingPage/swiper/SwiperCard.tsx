import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';

// import required modules
import { EffectCreative } from 'swiper/modules';
import { Image } from '@mantine/core';


export const SwiperCard = () => {
  return (
    <>
      <Swiper
        grabCursor={true}
        effect={'creative'}
        autoplay={{
          delay: 1000,
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
        modules={[EffectCreative]}
        className="mySwiper"
      >
        <SwiperSlide>
          <Image
            radius="md"
            src="uploads/slide1.jpg"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            radius="md"
            src="uploads/slide2.jpg"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            radius="md"
            src="uploads/slide3.png"
          />
        </SwiperSlide>
      </Swiper>
    </>
  );
};
