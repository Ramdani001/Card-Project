import ListTransaction from "@/components/Dashboard/Transaction/ListTransaction";
import { Box, Paper } from "@mantine/core";

export const PageTransaction = () => {
  return (
    <>
      <Box bg={"#0000"}>
        <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
          <ListTransaction isNonDashboard={true} />
        </Paper>
      </Box>
    </>
  );
};
