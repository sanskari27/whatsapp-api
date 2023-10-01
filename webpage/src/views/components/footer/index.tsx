import { Box, Button, Flex, Text } from "@chakra-ui/react";

export default function Footer() {
    return (
        <Flex
            px="3rem"
            py="1rem"
            className="flex-col  items-center gap-y-3 md:flex-row md:text-m"
            justifyContent={"space-between"}
        >
            <Box>LOGO</Box>
            <Text ml={"10rem"} justifySelf={"center"}>
                @ WhatsLeads
            </Text>
            <Flex gap={"1rem"}>
                <Button
                    border={"none"}
                    _active={{ border: "none", outline: "none" }}
                    variant="link"
                >
                    Privacy Policy
                </Button>
                <Button
                    border={"none"}
                    _active={{ border: "none", outline: "none" }}
                    variant="link"
                >
                    Terms & Conditions
                </Button>
            </Flex>
        </Flex>
    );
}
