import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Image,
    Input,
    Text,
    VStack,
    useRadioGroup,
} from "@chakra-ui/react";
import { COUPON, TICK } from "../../../assets/Images";
import CouponBanner from "./components/couponBanner";

const CheckoutPage = () => {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "framework",
        defaultValue: "react",
        onChange: console.log,
    });

    const group = getRootProps();

    const radio = getRadioProps({ value: "Welcome - 40% off" } as any);

    return (
        <Flex direction={"column"} padding={"1rem"}>
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
            <Flex alignItems={"center"} mt={"0.5rem"}>
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
            <Text
                className="text-[#4CB072]"
                fontWeight={"semibold"}
                fontSize={"md"}
                mt={"0.5rem"}
            >
                Coupon
            </Text>
            <HStack
                backgroundColor={"#4CB072"}
                rounded={"md"}
                py={"0.5rem"}
                px={"1rem"}
                mt={"1rem"}
            >
                <Image src={COUPON} alt="" />
                <Input variant={"unstyled"} textColor={"white"} />
                <Image src={TICK} alt="" width={"15px"} />
            </HStack>
            <VStack {...group} mt={"1rem"}>
                <CouponBanner {...radio}>Welcome - 40% off</CouponBanner>
            </VStack>
            <Text
                className="text-[#4CB072]"
                fontWeight={"semibold"}
                fontSize={"sm"}
                mt={"0.5rem"}
                alignSelf={"flex-end"}
            >
                Coupon Applied
            </Text>
            <Box
                className="bg-[#ECECEC] dark:bg-[#535353]"
                p={"1rem"}
                borderRadius={"10px"}
                mt={"0.5rem"}
                fontSize={"lg"}
            >
                <Flex width={"full"} justifyContent={"space-between"}>
                    <Text className="text-black dark:text-white">
                        Total Amount
                    </Text>
                    <Text className="text-black dark:text-white">5000</Text>
                </Flex>
                <Flex width={"full"} justifyContent={"space-between"}>
                    <Text className="text-black dark:text-white">Discount</Text>
                    <Text className="text-[#4CB072]" fontSize={"md"}>
                        -3000
                    </Text>
                </Flex>
                <Divider orientation="horizontal" my={"0.5rem"} />
                <Flex width={"full"} justifyContent={"space-between"}>
                    <Text
                        className="text-black dark:text-white"
                        fontWeight={"semibold"}
                    >
                        Total Amount
                    </Text>
                    <Text className="text-[#4CB072]">2000</Text>
                </Flex>
            </Box>
            <Button
                width={"auto"}
                my={"0.5rem"}
                backgroundColor={"#4CB072"}
                textColor={"white"}
            >
                <Text fontWeight={"semibold"} fontSize={"xl"}>
                    Pay
                </Text>
                <Box ml={"0.5rem"}>
                    <Text textDecoration={"line-through"} fontSize={"xs"}>
                        2000
                    </Text>
                    <Text>1000</Text>
                </Box>
            </Button>
        </Flex>
    );
};

export default CheckoutPage;
