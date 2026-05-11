"use client";

import { MainProfile } from "@/components/LandingPage/profile/MainProfile";
import { Center, Loader } from "@mantine/core";
import { Suspense } from "react";

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
