"use client";

import { SinglePageArct } from "@/components/LandingPage/Article/SinglePageArct";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params?.id;

  if (!id || typeof id !== "string") {
    return <div>Invalid Article</div>;
  }

  return (
    <>
      <HeaderSection />
      <SinglePageArct articleId={id} />
    </>
  );
}
