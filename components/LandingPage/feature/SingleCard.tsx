import { Badge, Box, Button, Card, Center, Group, Image, ScrollArea, SimpleGrid, Text} from "@mantine/core";
import { CardSingle } from "../Card/CardSingle";

export const SingleCard = () => {
  return (
    <>
        <Box mb={30} mt={50} px={30}>
            <Center>
                <ScrollArea
                scrollbars="x"
                >
                <Group wrap="nowrap" gap="xl">
                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>
                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>

                    <Box miw={250} className="cardHover">
                    <CardSingle />
                    </Box>
                </Group>
                </ScrollArea>

            </Center>
            <Center>
                <Button py={10} px={30} bg={"#0035d4"} mt={20}>
                    <Text size="xl">
                        More ...
                    </Text>
                </Button>
            </Center>
        </Box>
    </>
  );
};