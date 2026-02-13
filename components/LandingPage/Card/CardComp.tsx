import { Badge, Button, Card, Center, Group, Image, Text} from "@mantine/core";


export const CardComp = () => {
  return (
    <>
            <Card>
                <Card.Section>
                    <Image
                    src="https://tcg-corner.com/cdn/shop/files/Pokemon_700x875_crop_center.gif?v=1733996578"
                    height={320}
                    alt="Card"
                    />
                </Card.Section>
            </Card>
            <Center pt={10}>
                <Text>
                    Yugioh
                </Text>
            </Center>
    </>
  );
};