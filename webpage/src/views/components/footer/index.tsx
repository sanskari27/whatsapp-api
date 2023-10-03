import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/const";

export default function Footer() {
    const navigate = useNavigate();

    return (
        <Flex
            px="3rem"
            py="1rem"
            className="flex-col  items-center gap-y-3 md:flex-row md:text-m"
            justifyContent={"space-between"}
            backgroundColor={"white"}
            shadow={"2xl"}
            position={"absolute"}
            bottom={0}
            width={"100%"}
        >
            <Box>LOGO</Box>
            <Text justifySelf={"center"} className="ml-0 md:ml-40">
                @ WhatsLeads
            </Text>
            <Flex gap={"1rem"}>
                <Button
                    border={"none"}
                    _active={{ border: "none", outline: "none" }}
                    variant="link"
                    onClick={() => {
                        navigate(ROUTES.PRIVACY_POLICY);
                    }}
                >
                    Privacy Policy
                </Button>
                <Button
                    border={"none"}
                    _active={{ border: "none", outline: "none" }}
                    variant="link"
                    onClick={() => {
                        navigate(ROUTES.TERMS_AND_CONDITIONS);
                    }}
                >
                    Terms & Conditions
                </Button>
            </Flex>
        </Flex>
    );
}
