"use client";

import { Center, Loader } from "@mantine/core";
import { SinglePageArct } from "@/components/LandingPage/Article/SinglePageArct";
import { HeaderSection } from "@/components/LandingPage/HeaderSection";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";

// interface PageProps {
//   params: {
//     id: string;
//   };
// }


export default function Page() {
    const [cartItems, _setCartItems] = useState<CartItemDto[]>([]);
    const [_isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [search, setSearch] = useState("");

    const params = useParams();
    const id = params?.id;

    if (!id || typeof id !== "string") {
        return <div>Invalid Article</div>;
    }

  return (
    // <Suspense
    //   fallback={
    //     <Center h="100vh">
    //       <Loader size="xl" />
    //     </Center>
    //   }
    // >
        <>
            <HeaderSection search={search} setSearch={setSearch} cartItems={cartItems} setIsDrawerOpen={setIsDrawerOpen} />

            <SinglePageArct articleId={id} />
        </>
    // </Suspense>
  );
}
