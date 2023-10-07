import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
    FACEBOOK,
    INSTAGRAM,
    LOGO,
    TWITTER,
    WHATSAPP,
} from "../../../assets/Images";
import { ROUTES, THEME } from "../../../utils/const";

export default function Footer() {
    const navigate = useNavigate();

    return (
        <Flex
            px="3rem"
            py="1rem"
            className="flex-col justify-between text-sm items-center gap-y-3 md:flex-row md:text-m"
            position={"absolute"}
            bottom={0}
            width={"full"}
        >
            <Flex alignItems={"center"}>
                <Image src={LOGO} height={"40px"} />
                <Text
                    fontSize={"md"}
                    fontWeight={"medium"}
                    color={THEME.THEME_GREEN}
                >
                    WhatsLeads
                </Text>
            </Flex>
            <Button
                variant={"link"}
                fontWeight={"light"}
                onClick={() => navigate(ROUTES.PRIVACY_POLICY)}
                className="cursor-pointer text-green-700"
            >
                Privacy Policy
            </Button>
            <span>&copy; Whatsleads </span>
            <Button
                variant={"link"}
                fontWeight={"light"}
                onClick={() => navigate(ROUTES.TERMS_AND_CONDITIONS)}
                className="cursor-pointer text-green-700"
            >
                Terms & Conditions
            </Button>
            <span className="flex gap-x-2">
                <a className="cursor-pointer">
                    <img src={FACEBOOK} />
                </a>
                <a className="cursor-pointer">
                    <img src={INSTAGRAM} />
                </a>
                <a className="cursor-pointer">
                    <img src={TWITTER} />
                </a>
                <a className="cursor-pointer">
                    <img src={WHATSAPP} />
                </a>
            </span>
        </Flex>
    );
}
