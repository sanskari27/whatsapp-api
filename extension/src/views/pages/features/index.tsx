import { Button } from "@chakra-ui/button";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { useNavigate } from "react-router";
import { NAVIGATION } from "../../../config/const";
import BackButton from "../../components/back-button";

const Features = () => {
    const navigate = useNavigate();

    return (
        <Flex direction={"column"} padding={"1rem"}>
            <BackButton />
            <Flex>
                <Text
                    fontSize={"lg"}
                    fontWeight={"semibold"}
                    className="text-[#4CB072]"
                    mr={"0.5rem"}
                >
                    Pay
                </Text>
                <Text
                    fontSize={"lg"}
                    fontWeight={"semibold"}
                    className="text-black dark:text-white"
                >
                    To Use The Feature
                </Text>
            </Flex>
            <Text
                className="text-black dark:text-white"
                mt={"0.5rem"}
                fontSize={"lg"}
            >
                Features Included In
            </Text>
            <Text className="text-black dark:text-white" fontSize={"lg"}>
                The Package
            </Text>
            <Flex alignItems={"center"} mt={"1rem"}>
                <Box
                    as="span"
                    height={"2px"}
                    width={"20px"}
                    backgroundColor={"#4CB072"}
                    mr={"0.5rem"}
                />
                <Text className="text-black dark:text-white" fontSize={"md"}>
                    80% customers don't save you number
                </Text>
            </Flex>
            <Flex alignItems={"center"}>
                <Box
                    as="span"
                    height={"2px"}
                    width={"20px"}
                    backgroundColor={"#4CB072"}
                    mr={"0.5rem"}
                />
                <Text className="text-black dark:text-white" fontSize={"md"}>
                    Find unsaved Client to Grow your Business
                </Text>
            </Flex>
            <Flex alignItems={"center"}>
                <Box
                    as="span"
                    height={"2px"}
                    width={"20px"}
                    backgroundColor={"#4CB072"}
                    mr={"0.5rem"}
                />
                <Text className="text-black dark:text-white" fontSize={"md"}>
                    Find 1000s of contacts from Group
                </Text>
            </Flex>
            <Flex alignItems={"flex-start"}>
                <Box
                    as="span"
                    height={"2px"}
                    width={"20px"}
                    backgroundColor={"#4CB072"}
                    mr={"0.5rem"}
                    mt={"0.8rem"}
                />
                <Text
                    className="text-black dark:text-white"
                    width={"90%"}
                    fontSize={"md"}
                >
                    Pay once and download unlimited times for a month
                </Text>
            </Flex>
            <Button
                width={"full"}
                backgroundColor={"#4CB072"}
                textColor={"white"}
                mt={"6rem"}
                position={"relative"}
                onClick={() => navigate(NAVIGATION.CHECKOUT)}
            >
                Proceed to pay
            </Button>
        </Flex>
    );
};
export default Features;
