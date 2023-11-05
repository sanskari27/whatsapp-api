import { CheckIcon, CloseIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Input,
    Text,
} from "@chakra-ui/react";
import { THEME, TRANSACTION_STATUS } from "../../../../utils/const";

type CheckoutProps = {
    transaction: {
        [TRANSACTION_STATUS.CODE]: string;
        [TRANSACTION_STATUS.CHECKING_COUPON]: boolean;
        [TRANSACTION_STATUS.COUPON_VALID]: boolean;
        [TRANSACTION_STATUS.COUPON_ERROR]: string;
        [TRANSACTION_STATUS.TRANSACTION_ID]: string;
        [TRANSACTION_STATUS.GROSS_AMOUNT]: string;
        [TRANSACTION_STATUS.TAX]: string;
        [TRANSACTION_STATUS.DISCOUNT]: string;
        [TRANSACTION_STATUS.TOTAL_AMOUNT]: string;
        [TRANSACTION_STATUS.TRANSACTION_ERROR]: string;
        [TRANSACTION_STATUS.BUCKET_ID]: string;
        [TRANSACTION_STATUS.STATUS]: boolean;
    };
    type: "one-time" | "subscription";
    handleChange: (e: { name: TRANSACTION_STATUS; value: string }) => void;
    handleApplyCoupon: (code: string) => void;
};

const Checkout = ({
    transaction,
    type,
    handleApplyCoupon,
    handleChange,
}: CheckoutProps) => {
    const { CODE, CHECKING_COUPON, COUPON_VALID, COUPON_ERROR, STATUS } =
        transaction;

    return (
        <Box hidden={!STATUS}>
            {type === "one-time" ? (
                <>
                    <Text
                        fontSize={"2xl"}
                        fontWeight={"medium"}
                        textAlign={"center"}
                    >
                        Have A{" "}
                        <Box as="span" color={THEME.THEME_GREEN}>
                            Coupon?
                        </Box>
                    </Text>
                    <HStack
                        backgroundColor={"green.500"}
                        rounded={"md"}
                        py={"0.5rem"}
                        pl={"1rem"}
                        mt={"1rem"}
                        mb="0.5rem"
                    >
                        {/* <Image src={COUPON} alt="" width={"2rem"} /> */}
                        <Input
                            variant={"unstyled"}
                            textColor={"white"}
                            textAlign={"center"}
                            value={CODE}
                            placeholder={"Enter Coupon Code"}
                            _placeholder={{
                                color: "gray.200",
                            }}
                            isDisabled={COUPON_VALID && !!CODE}
                            onChange={(e) =>
                                handleChange({
                                    name: TRANSACTION_STATUS.CODE,
                                    value: e.target.value.toUpperCase(),
                                })
                            }
                        />

                        <Button
                            variant={"link"}
                            onClick={() => handleApplyCoupon(CODE)}
                            isDisabled={!CODE}
                            isLoading={CHECKING_COUPON}
                        >
                            {COUPON_VALID ? (
                                <CloseIcon
                                    color={"gray.400"}
                                    height="1rem"
                                    width={"1rem"}
                                />
                            ) : COUPON_ERROR ? (
                                <WarningTwoIcon
                                    color={"red.400"}
                                    height="1rem"
                                    width={"1rem"}
                                />
                            ) : (
                                <CheckIcon
                                    color={"white"}
                                    height="1rem"
                                    width={"1rem"}
                                />
                            )}
                        </Button>
                    </HStack>
                </>
            ) : (
                <Text
                    fontSize={"2xl"}
                    fontWeight={"medium"}
                    textAlign={"center"}
                    py={"1rem"}
                >
                    Checkout
                </Text>
            )}
            <Text
                textColor="red.400"
                fontWeight={"semibold"}
                fontSize={"sm"}
                mt={"0.5rem"}
                alignSelf={"flex-end"}
            >
                {COUPON_ERROR}
            </Text>
            <Box
                className="bg-[#ECECEC] dark:bg-[#535353]"
                p={"1rem"}
                borderRadius={"10px"}
                mt={"0.5rem"}
            >
                <Flex width={"full"} justifyContent={"space-between"}>
                    <Text className="text-black dark:text-white">
                        Gross Amount
                    </Text>
                    <Text className="text-black dark:text-white">
                        {transaction[TRANSACTION_STATUS.GROSS_AMOUNT]}
                    </Text>
                </Flex>
                <Flex width={"full"} justifyContent={"space-between"}>
                    <Text className="text-black dark:text-white">Tax</Text>
                    <Text className="text-black dark:text-white">
                        {transaction[TRANSACTION_STATUS.TAX]}
                    </Text>
                </Flex>
                {COUPON_VALID || transaction[TRANSACTION_STATUS.DISCOUNT] ? (
                    <Flex width={"full"} justifyContent={"space-between"}>
                        <Text className="text-black dark:text-white">
                            Discount
                        </Text>
                        <Text className="text-[#4CB072]">
                            -{transaction[TRANSACTION_STATUS.DISCOUNT]}
                        </Text>
                    </Flex>
                ) : null}
                <Divider orientation="horizontal" my={"0.5rem"} />
                <Flex
                    width={"full"}
                    justifyContent={"space-between"}
                    fontWeight={"semibold"}
                >
                    <Text className="text-black dark:text-white">
                        Total Amount
                    </Text>
                    <Text className="text-[#4CB072]">
                        {transaction[TRANSACTION_STATUS.TOTAL_AMOUNT]}
                    </Text>
                </Flex>
            </Box>

            <Text
                textColor="red.400"
                textAlign={"center"}
                fontWeight={"semibold"}
                fontSize={"sm"}
            >
                {transaction[TRANSACTION_STATUS.TRANSACTION_ERROR]}
            </Text>
        </Box>
    );
};

export default Checkout;
