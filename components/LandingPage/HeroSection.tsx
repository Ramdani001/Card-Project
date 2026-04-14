import { Box, Center, Container, SimpleGrid } from "@mantine/core";
import { CardComp } from "./Card/CardComp";

export const HeroSection = () => {
  return (
    <Container fluid mt={50}>
      <Center mb={{ base: 20, md: 40 }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={{ base: "md", md: "xl" }} verticalSpacing="md">
          <Box className="cardHover">
            <CardComp />
          </Box>
          <Box className="cardHover">
            <CardComp />
          </Box>
          <Box className="cardHover">
            <CardComp />
          </Box>
        </SimpleGrid>
      </Center>
    </Container>
  );
};
