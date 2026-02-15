import { Box, Card, FileInput, Group, Image, Paper, SimpleGrid, TextInput } from "@mantine/core";

export const PageProfile = () => {

  return (
    <>
        <Box bg={"#0000"} w={{base: 300, md: 600, lg: 1000}}>
            <Paper p="md" radius="xs" bg="white" withBorder style={{ borderColor: "#dee2e6" }}>
                <SimpleGrid cols={2}>
                    <Box w={"100%"} mt={40}>
                        <TextInput placeholder="Full Name"/>
                        <TextInput placeholder="Email" mt={20}/>
                        <FileInput placeholder="Upload Profile" mt={10} />
                    </Box>

                    <Box w={{base: 100, md: 250, lg: 500}}>
                        <Card>
                             <Card.Section>
                                <Image
                                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"

                                height={360}
                                alt="Norway"
                                />
                            </Card.Section>

                        </Card>
                    </Box>
                </SimpleGrid>
            </Paper>
        </Box>
    </>
  );
};