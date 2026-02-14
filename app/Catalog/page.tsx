"use client";

import { Suspense } from "react";
import { Center, Loader } from "@mantine/core";
import MainCatalog from "@/components/LandingPage/Catalog/MainCatalog";

export default function page() {
  return (
    <Suspense
      fallback={
        <Center h="100vh">
          <Loader size="xl" />
        </Center>
      }
    >
      <MainCatalog />
    </Suspense>
  );
}
