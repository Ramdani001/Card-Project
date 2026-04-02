import ListTransaction from "@/components/Dashboard/Transaction/ListTransaction";
import { Box, Paper } from "@mantine/core";

export const PageTransaction = () => {
  return (
    <>
      <Box bg={"#0000"} w={{ base: 300, md: 600, lg: 1000 }}>
        <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
          <ListTransaction isNonDashboard={true} />
        </Paper>
      </Box>
    </>
  );
};
