"use client";

import { SessionProvider } from "next-auth/react";
import MainDashboard from "./MainDashboard";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <MainDashboard />
    </SessionProvider>
  );
}
