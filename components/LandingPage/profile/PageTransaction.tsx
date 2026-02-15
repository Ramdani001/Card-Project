import ListTransaction from "@/components/Transaction/ListTransaction";
import { Box, Card, FileInput, Group, Image, Paper, SimpleGrid, TextInput } from "@mantine/core";
import { useSession } from "next-auth/react";

export const PageTransaction = () => {
//   const { data: session } = useSession();

  return (
    <>
        <Box bg={"#0000"} w={{base: 300, md: 600, lg: 1000}}>
            <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
               <ListTransaction />
               {/* <h2>{session?.user.id}</h2> */}
            </Paper>
        </Box>
    </>
  );
};