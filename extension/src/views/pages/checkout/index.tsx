import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Image,
    Input,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { COUPON, CROSS, TICK } from "../../../assets/Images";
import { COUPON_STATUS } from "../../../config/const";
import BackButton from "../../components/back-button";
import CouponBanner from "./components/couponBanner";

const CheckoutPage = () => {
    const [coupon, setCoupon] = useState({
        [COUPON_STATUS.CODE]: "",
    });

    const { CODE } = coupon;

    const [couponStatus, setCouponStatus] = useState({
        [COUPON_STATUS.VALID]: false,
    });

    const { VALID } = couponStatus;

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const checkCoupon = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setCouponStatus({ ...couponStatus, [COUPON_STATUS.VALID]: false });
            if (VALID) {
                setStatus("Coupon Applied");
            } else {
                setStatus("Invalid Coupon");
            }
        }, 1000);
    };

    const handleChange = async ({
        name,
        value,
    }: {
        name: string;
        value: string;
    }) => {
        setCoupon((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        checkCoupon();
    };

    return (
        <Flex direction={"column"} padding={"1rem"}>
            <BackButton />
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
                pl={"1rem"}
                mt={"1rem"}
            >
                <Image src={COUPON} alt="" />
                <Input
                    variant={"unstyled"}
                    textColor={"white"}
                    textAlign={"center"}
                    value={CODE}
                    onChange={(e) => {
                        setCoupon({
                            ...coupon,
                            [COUPON_STATUS.CODE]: e.target.value,
                        });
                    }}
                />
                <Button
                    variant={"link"}
                    onClick={checkCoupon}
                    isLoading={loading}
                >
                    {VALID ? (
                        <Image src={TICK} alt="" width={"15px"} />
                    ) : (
                        <Image src={CROSS} alt="" />
                    )}
                    {/* <Image src={TICK} alt="" width={"15px"} /> */}
                </Button>
            </HStack>
            <CouponBanner isChecked={VALID} onClick={handleChange}>
                Welcome - 40% off
            </CouponBanner>
            <Text
                className="text-[#4CB072]"
                fontWeight={"semibold"}
                fontSize={"sm"}
                mt={"0.5rem"}
                alignSelf={"flex-end"}
            >
                {status}
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
