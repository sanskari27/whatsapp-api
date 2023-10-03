import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import {
    ENHANCHMENT,
    EXPORT,
    HERO_BG,
    RATING,
    REPORT,
    SCREEN_SHOT,
} from "../../../assets/Images";
import { THEME } from "../../../utils/const";
import PageWrapper from "../../components/pageWrapper";

const Home = () => {
    return (
        <PageWrapper>
            <Box>
                <Flex
                    width={"full"}
                    justifyContent={"space-around"}
                    backgroundImage={` linear-gradient(to right,rgba(255,255,255,1),rgba(255,255,255,1), rgba(255,255,255,0.7)), url('${HERO_BG}')`}
                    alignItems={"center"}
                    className="flex-col md:flex-row"
                    pt={"2rem"}
                    px={"1rem"}
                    py={"3rem"}
                >
                    <Box>
                        <Box pb={"2rem"}>
                            <Text
                                className="text-md text-center md:text-xl md:text-left "
                                fontWeight={"medium"}
                            >
                                A Chrome extension for{" "}
                                <Box as="span" color={THEME.THEME_GREEN}>
                                    Whatsapp
                                </Box>{" "}
                                that
                            </Text>
                            <Text
                                className="text-md text-center md:text-xl md:text-left "
                                fontWeight={"medium"}
                            >
                                enables you to effortlessly save all your
                            </Text>
                            <Text
                                className="text-md text-center md:text-xl md:text-left "
                                fontWeight={"medium"}
                            >
                                contacts,groups and labels with just
                            </Text>
                            <Text
                                className="text-md text-center md:text-xl md:text-left "
                                fontWeight={"medium"}
                            >
                                one click.
                            </Text>
                        </Box>
                        <Box>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    80% customers don't save your number
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Find unsaved Client to Grow your Business
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Find 1000s of contacts from Group
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Pay once and download unlimited times for a
                                    month
                                </Text>
                            </Flex>
                        </Box>
                    </Box>
                    <Flex className="w-full md:w-1/2" justifyContent={"center"}>
                        <Image
                            className="w-2/3"
                            maxWidth={"500px"}
                            minWidth={"300px"}
                            src={SCREEN_SHOT}
                            alt=""
                        />
                    </Flex>
                </Flex>
                <Flex
                    width={"full"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    direction={"column"}
                    gap={"2rem"}
                    mt={"2rem"}
                >
                    <Text
                        fontSize={"xl"}
                        textAlign={"center"}
                        fontWeight={"medium"}
                    >
                        What is{" "}
                        <Box as="span" color={THEME.THEME_GREEN}>
                            WhatsLeads
                        </Box>{" "}
                    </Text>
                </Flex>
                <Flex
                    id="features"
                    className="flex-col md:flex-row"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                    pt={"2rem"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={REPORT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Text
                            fontSize={"xl"}
                            fontWeight={"medium"}
                            className="text-center md:text-left"
                        >
                            Save All Your{" "}
                            <Box as={"span"} color={THEME.THEME_GREEN}>
                                {" "}
                                Unsaved Contacts
                            </Box>
                        </Text>
                        <Text className="text-center md:text-left">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Aliquid, ullam odit. Eaque iste totam neque
                            recusandae, sequi nesciunt excepturi animi dolore
                            unde placeat id impedit ducimus deleniti porro, ipsa
                            iure?
                        </Text>
                    </Box>
                </Flex>
                <Flex
                    className="flex-col md:flex-row-reverse"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={EXPORT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Box>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                            >
                                View And{" "}
                                <Box as={"span"} color={THEME.THEME_GREEN}>
                                    {" "}
                                    Manage Whatsapp
                                </Box>
                            </Text>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                                color={THEME.THEME_GREEN}
                            >
                                Contacts{" "}
                                <Box as={"span"} color={"black"}>
                                    {" "}
                                    With Ease
                                </Box>
                            </Text>
                        </Box>
                        <Text className="text-center md:text-left">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Aliquid, ullam odit. Eaque iste totam neque
                            recusandae, sequi nesciunt excepturi animi dolore
                            unde placeat id impedit ducimus deleniti porro, ipsa
                            iure?
                        </Text>
                    </Box>
                </Flex>
                <Flex
                    className="flex-col md:flex-row"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={ENHANCHMENT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Box>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                                color={THEME.THEME_GREEN}
                            >
                                Enhance Your Privacy{" "}
                                <Box as={"span"} color={"black"}>
                                    {" "}
                                    With
                                </Box>
                            </Text>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                            >
                                Advance Features
                            </Text>
                        </Box>
                        <Text className="text-center md:text-left">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Aliquid, ullam odit. Eaque iste totam neque
                            recusandae, sequi nesciunt excepturi animi dolore
                            unde placeat id impedit ducimus deleniti porro, ipsa
                            iure?
                        </Text>
                    </Box>
                </Flex>
                <Box>
                    <Text
                        textAlign={"center"}
                        fontWeight={"medium"}
                        fontSize={"xl"}
                    >
                        What Customers Love About WhatsLeads
                    </Text>

                    <Flex
                        gap={"5rem"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        pt={"3rem"}
                        className="flex-col md:flex-row"
                        flexWrap={"wrap"}
                    >
                        <Box
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                        >
                            <Flex
                                width={"full"}
                                justifyContent={"space-between"}
                            >
                                <Text>Name Surname</Text>
                                <Image height={"15px"} src={RATING} alt="" />
                            </Flex>
                            <Text fontSize={"sm"} pt={"1rem"}>
                                Lorem ipsum, dolor sit amet consectetur
                                adipisicing elit. Ipsum nemo, ipsam ut accusamus
                                possimus atque corrupti, repudiandae similique
                                voluptas praesentium sapiente temporibus natus
                                aperiam porro cumque magnam vel amet illo.
                            </Text>
                        </Box>
                        <Box
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                        >
                            <Flex
                                width={"full"}
                                justifyContent={"space-between"}
                            >
                                <Text>Name Surname</Text>
                                <Image height={"15px"} src={RATING} alt="" />
                            </Flex>
                            <Text fontSize={"sm"} pt={"1rem"}>
                                Lorem ipsum, dolor sit amet consectetur
                                adipisicing elit. Ipsum nemo, ipsam ut accusamus
                                possimus atque corrupti, repudiandae similique
                                voluptas praesentium sapiente temporibus natus
                                aperiam porro cumque magnam vel amet illo.
                            </Text>
                        </Box>
                        <Box
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                        >
                            <Flex
                                width={"full"}
                                justifyContent={"space-between"}
                            >
                                <Text>Name Surname</Text>
                                <Image height={"15px"} src={RATING} alt="" />
                            </Flex>
                            <Text fontSize={"sm"} pt={"1rem"}>
                                Lorem ipsum, dolor sit amet consectetur
                                adipisicing elit. Ipsum nemo, ipsam ut accusamus
                                possimus atque corrupti, repudiandae similique
                                voluptas praesentium sapiente temporibus natus
                                aperiam porro cumque magnam vel amet illo.
                            </Text>
                        </Box>
                    </Flex>
                </Box>
                <Flex id="pricing" direction={"column"} py={"3rem"} px={"1rem"}>
                    <Text
                        textAlign={"center"}
                        fontSize={"xl"}
                        fontWeight={"medium"}
                    >
                        <Box as={"span"} color={THEME.THEME_GREEN}>
                            Simple Pricing{" "}
                        </Box>
                        For You
                    </Text>
                    <Flex
                        mx={"auto"}
                        boxShadow={"0px 0px 10px 5px #00000029"}
                        rounded={"lg"}
                        mt={"2rem"}
                    >
                        <Box
                            backgroundColor={THEME.THEME_GREEN}
                            p={"1rem"}
                            rounded={"lg"}
                        >
                            <Text
                                color={"white"}
                                px={"0.25rem"}
                                textAlign={"center"}
                            >
                                Premium
                            </Text>
                            <Text
                                color={"white"}
                                py={"0.25rem"}
                                textAlign={"center"}
                            >
                                ₹ 250/-
                            </Text>
                            <Button
                                rounded={"full"}
                                backgroundColor={"white"}
                                size={"sm"}
                                px={"1rem"}
                            >
                                Get Started
                            </Button>
                        </Box>
                        <Box px={"1rem"} py={"0.5rem"}>
                            <Text>Heading</Text>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    80% customers don't save your number
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>
                </Flex>
            </Box>
        </PageWrapper>
    );
};
export default Home;
