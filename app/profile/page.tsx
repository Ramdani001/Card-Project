"use client";

import { Suspense, useState } from "react";
import { Center, Loader } from "@mantine/core";
import { MainProfile } from "@/components/LandingPage/profile/MainProfile";

export default function page() {
  return (
    <Suspense
      fallback={
        <Center h="100vh">
          <Loader size="xl" />
        </Center>
      }
    >
      <MainProfile />
    </Suspense>
  );
}
