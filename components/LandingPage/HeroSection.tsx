import { Badge, Box, Button, Card, Center, Container, Grid, Group, Image, SimpleGrid, Text} from "@mantine/core";
import { CardComp } from "./Card/CardComp";
import { SwiperCard } from "./swiper/SwiperCard";


export const HeroSection = () => {
  return (
    <Box py={50}>
      <Container size="xl">

        {/* Hero Section */}
       <Center mb={{base: 5, md: 7, lg: 20}}>
        <SimpleGrid cols={{ base: 0, md: 6, lg: 3 }} spacing="xl">
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
    </Box>
  );
};
