import {
    Box,
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
import { MENU } from "../../../assets/Images";
export default function Navbar() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Flex
            bg="#4CB072"
            p={"1rem"}
            justifyContent={"space-between"}
            alignItems={"center"}
            position={"fixed"}
            top={0}
            width={"100%"}
            zIndex={1000}
        >
            <Box>LOGO</Box>
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
                        window.location.assign("#features");
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
                        window.location.assign("#pricing");
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
                >
                    FAQs
                </Button>

                <Button
                    variant={"solid"}
                    backgroundColor={"white"}
                    rounded={"full"}
                    outline={"none"}
                >
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
                size={"xs"}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />

                    <DrawerBody backgroundColor={"#4CB072"}>
                        <Flex
                            direction={"column"}
                            pt={"2rem"}
                            alignItems={"flex-start"}
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
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
        // <header>
        //     <nav
        //         className="
        //   flex flex-wrap
        //   items-center
        //   justify-between
        //   w-full
        //   py-2
        //   md:py-0
        //   px-6
        //   text-sm
        //   bg-[#4CB072]
        //   text-white
        // "
        //     >
        //         <div>
        //             <a href="#">LOGO</a>
        //         </div>

        //         <svg
        //             xmlns="http://www.w3.org/2000/svg"
        //             onClick={() => {
        //                 setHidden(!hidden);
        //             }}
        //             className="h-6 w-6 cursor-pointer md:hidden block"
        //             fill="none"
        //             viewBox="0 0 24 24"
        //             stroke="currentColor"
        //         >
        //             <path
        //                 stroke-linecap="round"
        //                 stroke-linejoin="round"
        //                 stroke-width="2"
        //                 d="M4 6h16M4 12h16M4 18h16"
        //             />
        //         </svg>

        //         <div
        //             className={
        //                 hidden
        //                     ? "hidden"
        //                     : "w-full md:flex md:items-center md:w-auto"
        //             }
        //         >
        //             <ul
        //                 className="
        //                         pt-4
        //                         md:flex
        //                         md:justify-between
        //                         md:pt-0"
        //             >
        //                 <li>
        //                     <a
        //                         className="md:p-4 py-2 block hover:text-black"
        //                         href="#"
        //                     >
        //                         Features
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a
        //                         className="md:p-4 py-2 block hover:text-black"
        //                         href="#"
        //                     >
        //                         Pricing
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a
        //                         className="md:p-4 py-2 block hover:text-black"
        //                         href="#"
        //                     >
        //                         FAQs
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a
        //                         className="md:p-4 py-2 block hover:text-black"
        //                         href="#"
        //                     >
        //                         Add to Chrome
        //                     </a>
        //                 </li>
        //             </ul>
        //         </div>
        //     </nav>
        // </header>
    );
}
