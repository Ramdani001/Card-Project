"use client";

import { Suspense } from "react";
import { Center, Loader } from "@mantine/core";
import MainDashboard from "./MainDashboard";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <Center h="100vh">
          <Loader size="xl" />
        </Center>
      }
    >
      <MainDashboard />
    </Suspense>
  );
}
