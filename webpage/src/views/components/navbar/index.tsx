import {
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerOverlay,
    Flex,
    Image,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CHROME_GREEN, LOGO, MENU } from "../../../assets/Images";
import { ROUTES, THEME } from "../../../utils/const";

type NavbarProps = { scrollFunction: (id: string) => void }

export default function Navbar({ scrollFunction }: NavbarProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const navigate = useNavigate();

    return (
        <Flex
            bg="#4CB072"
            py={"0.5rem"}
            px={"1rem"}
            justifyContent={"space-between"}
            alignItems={"center"}
            position={"fixed"}
            top={0}
            width={"100%"}
            zIndex={1000}
        >
            <Flex alignItems={"center"} cursor='pointer' onClick={() => {
                navigate(ROUTES.HOME)
                scrollFunction("home")
            }}>
                <Image src={LOGO} alt="Logo" height={"35px"} />
                <Text
                    color={"white"}
                    fontSize={"lg"}
                    fontWeight={"bold"}
                    ml={"1rem"}
                >
                    WhatsLeads
                </Text>
            </Flex>
            <Flex
                className="!hidden md:!flex"
                gap={"2rem"}
                alignItems={"center "}
            >
                <Button
                    color={"white"}
                    variant={"link"}
                    outline={"none"}
                    border={"none"}
                    _hover={{ textColor: "green.300" }}
                    onClick={() => {
                        navigate(ROUTES.HOME)
                        scrollFunction("home")
                    }}
                >
                    Home
                </Button>
                <Button
                    color={"white"}
                    variant={"link"}
                    outline={"none"}
                    border={"none"}
                    _hover={{ textColor: "green.300" }}
                    onClick={() => {
                        navigate(ROUTES.HOME)
                        scrollFunction("features")
                    }}
                >
                    Features
                </Button>
                <Button
                    color={"white"}
                    variant={"link"}
                    outline={"none"}
                    border={"none"}
                    _hover={{ textColor: "green.300" }}
                    onClick={() => {
                        navigate(ROUTES.HOME)
                        scrollFunction("pricing")
                    }}
                >
                    Pricing
                </Button>
                <Button
                    color={"white"}
                    variant={"link"}
                    outline={"none"}
                    border={"none"}
                    _hover={{ textColor: "green.300" }}
                    onClick={() => {
                        navigate(ROUTES.HOME)
                        scrollFunction("faq")
                    }}
                >
                    FAQs
                </Button>

                <Button
                    variant={"solid"}
                    backgroundColor={"white"}
                    rounded={"full"}
                    outline={"none"}
                    gap={"0.5rem"}
                    onClick={() => {
                        window.open("https://chrome.google.com/webstore/detail/whatsleads/fcgjgjellnemnioihojklppanoldamnd?hl=en-GB&authuser=0")
                    }}
                >
                    <Image src={CHROME_GREEN} alt="" height={"60%"} />
                    <Text textColor={"#4CB072"}>Add to Chrome</Text>
                </Button>
            </Flex>
            <Button
                backgroundColor={"#4CB072"}
                _hover={{ backgroundColor: "#4CB072" }}
                variant={"link"}
                outline={"none"}
                border={"none"}
                className="!flex md:!hidden"
                onClick={onOpen}
            >
                <Image src={MENU} alt="Menu" />
            </Button>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                size={"full"}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />

                    <DrawerBody backgroundColor={"#4CB072"}>
                        <Flex
                            direction={"column"}
                            pt={"2rem"}
                            alignItems={"center"}
                            gap={"1.25rem"}
                        >
                            <Button
                                textAlign={"left"}
                                variant={"link"}
                                _hover={{ textColor: "green.300" }}
                                textColor={"white"}
                                transition={"0.1s"}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.assign("#features");
                                    onClose();
                                }}
                            >
                                Features
                            </Button>
                            <Button
                                textAlign={"left"}
                                alignItems={"flex-start"}
                                variant={"link"}
                                _hover={{ textColor: "green.300" }}
                                textColor={"white"}
                                transition={"0.1s"}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.assign("#pricing");
                                    onClose();
                                }}
                            >
                                Pricing
                            </Button>
                            <Button
                                textAlign={"left"}
                                alignItems={"flex-start"}
                                variant={"link"}
                                _hover={{ textColor: "green.300" }}
                                textColor={"white"}
                                transition={"0.1s"}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.assign("#");
                                }}
                            >
                                FAQs
                            </Button>
                            <Button
                                variant={"link"}
                                backgroundColor={"white"}
                                _hover={{ textColor: "green.300" }}
                                textColor={THEME.THEME_GREEN}
                                rounded={"full"}
                                size={"md"}
                                transition={"0.1s"}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.open("https://chrome.google.com/webstore/detail/whatsleads/fcgjgjellnemnioihojklppanoldamnd?hl=en-GB&authuser=0")
                                    window.location.assign("#faq");
                                    onClose();
                                }}
                                px={"0.5rem"}
                                py={"0.25rem"}

                            >
                                <Image
                                    src={CHROME_GREEN}
                                    alt=""
                                    height={"20px"}
                                />
                                <Text mx={"0.5rem"}>Add To Chrome</Text>
                            </Button>
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
}
