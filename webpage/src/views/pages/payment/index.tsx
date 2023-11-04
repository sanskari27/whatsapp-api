/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckIcon, CloseIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Image,
    Input,
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    Stepper,
    Text,
    useSteps,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useInterval } from "react-use";
import { TRANSACTION } from "../../../assets/Images";
import PaymentService from "../../../services/payment.service";
import {
    BILLING_PLANS_DETAILS,
    BILLING_PLANS_TYPE,
    ROUTES,
    SERVER_URL,
    THEME,
    TRANSACTION_STATUS,
} from "../../../utils/const";
import { Billing, Details, WANumber } from "./components";
import { BillingRef } from "./components/Billing";
import { DetailsRef } from "./components/Details";
import { WANumbersRef } from "./components/WANumber";

const steps = [
    { title: "Personal Details" },
    { title: "Device Number" },
    { title: "Billing Details" },
];

const userDetailsInit = {
    name: "",
    phone_number: "",
    email: "",
    type: "" as "one-time" | "subscription",
    whatsapp_number: "",
    billing_address: {
        street: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        country: "",
        gstin: "",
    },
};

export type UserDetailsType = typeof userDetailsInit;

const PaymentPage = () => {
    const { plan: plan_name } = useParams();

    const detailsRef = useRef<DetailsRef>(null);
    const waNumbersRef = useRef<WANumbersRef>(null);
    const billingRef = useRef<BillingRef>(null);

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const [loading, setLoading] = useState(false);

    const [transaction, setTransaction] = useState({
        [TRANSACTION_STATUS.CODE]: "",
        [TRANSACTION_STATUS.CHECKING_COUPON]: false,
        [TRANSACTION_STATUS.COUPON_VALID]: false,
        [TRANSACTION_STATUS.COUPON_ERROR]: "",
        [TRANSACTION_STATUS.TRANSACTION_ID]: "",
        [TRANSACTION_STATUS.GROSS_AMOUNT]: "",
        [TRANSACTION_STATUS.TAX]: "",
        [TRANSACTION_STATUS.DISCOUNT]: "",
        [TRANSACTION_STATUS.TOTAL_AMOUNT]: "",
        [TRANSACTION_STATUS.TRANSACTION_ERROR]: "",
        [TRANSACTION_STATUS.BUCKET_ID]: "",
        [TRANSACTION_STATUS.STATUS]: false,
    });

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        setTransaction((prevState) => ({
            ...prevState,
            [TRANSACTION_STATUS.TRANSACTION_ERROR]: "",
            [TRANSACTION_STATUS.STATUS]: false,
        }));
    };
    const handleNext = () => {
        if (
            !detailsRef.current ||
            !waNumbersRef.current ||
            !billingRef.current
        ) {
            return;
        }
        if (activeStep === 0) {
            if (!detailsRef.current.validate()) {
                return;
            }
        } else if (activeStep === 1) {
            if (!waNumbersRef.current.validate()) {
                return;
            }
        } else if (activeStep === 2) {
            if (!billingRef.current.validate()) {
                return;
            }
            handleSubmit();
            return;
        } else if (activeStep === 3) {
            handlePaymentClick();
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        if (
            !detailsRef.current ||
            !waNumbersRef.current ||
            !billingRef.current
        ) {
            return;
        }
        if (plan_name !== undefined) {
            const data = {
                ...detailsRef.current.getData(),
                plan_name: plan_name as BILLING_PLANS_TYPE,
                billing_address: {
                    ...billingRef.current.getData(),
                },
                whatsapp_numbers: waNumbersRef.current
                    .getData()
                    .map((number) => {
                        return `${number.country_code}${number.phone_number}`;
                    }),
                admin_number: `${
                    waNumbersRef.current.getData()[0].country_code
                }${waNumbersRef.current.getData()[0].phone_number}`,
            };
            PaymentService.initiateTransaction(data)
                .then((res) => {
                    setActiveStep((prev) => prev + 1);
                    setTransaction((prevState) => ({
                        ...prevState,
                        [TRANSACTION_STATUS.BUCKET_ID]: res?.bucket_id,
                        [TRANSACTION_STATUS.TOTAL_AMOUNT]: res?.total_amount,
                        [TRANSACTION_STATUS.GROSS_AMOUNT]: res?.gross_amount,
                        [TRANSACTION_STATUS.TAX]: res?.tax,
                        [TRANSACTION_STATUS.STATUS]: true,
                    }));
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err);
                });
        }
    };

    if (
        !Object.values(BILLING_PLANS_TYPE).includes(
            plan_name as unknown as BILLING_PLANS_TYPE
        )
    ) {
        return <Navigate to={ROUTES.PRICING} />;
    }

    const plan_details = BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];

    const { CODE, COUPON_VALID, COUPON_ERROR, CHECKING_COUPON } = transaction;

    const handleApplyCoupon = (CODE: string) => {
        if (COUPON_VALID) {
            PaymentService.removeCoupon(
                transaction[TRANSACTION_STATUS.BUCKET_ID]
            ).then((res) => {
                if (!res) {
                    setTransaction((prevState) => ({
                        ...prevState,
                        [TRANSACTION_STATUS.COUPON_ERROR]:
                            "Unable to remove coupon",
                    }));
                    return;
                }
                setTransaction((prevState) => ({
                    ...prevState,
                    [TRANSACTION_STATUS.TRANSACTION_ID]: res.transaction_id,
                    [TRANSACTION_STATUS.GROSS_AMOUNT]: res.gross_amount,
                    [TRANSACTION_STATUS.TAX]: res.tax,
                    [TRANSACTION_STATUS.DISCOUNT]: res.discount,
                    [TRANSACTION_STATUS.TOTAL_AMOUNT]: res.total_amount,
                    [TRANSACTION_STATUS.CODE]: "",
                    [TRANSACTION_STATUS.COUPON_VALID]: false,
                }));
            });
        } else if (COUPON_ERROR) {
            setTransaction((prevState) => ({
                ...prevState,
                [TRANSACTION_STATUS.CODE]: "",
                [TRANSACTION_STATUS.COUPON_ERROR]: "",
            }));
        } else {
            PaymentService.applyCoupon(
                transaction[TRANSACTION_STATUS.BUCKET_ID],
                CODE
            ).then((res) => {
                if (!res) {
                    setTransaction((prevState) => ({
                        ...prevState,
                        [TRANSACTION_STATUS.COUPON_ERROR]:
                            "Invalid Coupon Code",
                    }));
                    return;
                }

                setTransaction((prevState) => ({
                    ...prevState,
                    [TRANSACTION_STATUS.COUPON_VALID]: true,
                    [TRANSACTION_STATUS.TRANSACTION_ID]: res.transaction_id,
                    [TRANSACTION_STATUS.GROSS_AMOUNT]: res.gross_amount,
                    [TRANSACTION_STATUS.TAX]: res.tax,
                    [TRANSACTION_STATUS.DISCOUNT]: res.discount,
                    [TRANSACTION_STATUS.TOTAL_AMOUNT]: res.total_amount,
                }));
            });
        }
    };

    const handleChange = async ({
        name,
        value,
    }: {
        name: string;
        value: string | boolean;
    }) => {
        setTransaction((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePaymentClick = async () => {
        setLoading(true);
        if (detailsRef.current?.getData()?.type === "one-time") {
            if (!transaction[TRANSACTION_STATUS.BUCKET_ID]) return;
            PaymentService.initiateRazorpay(
                transaction[TRANSACTION_STATUS.BUCKET_ID]
            )
                .then((res) => {
                    setLoading(false);
                    const rzp1 = new (window as any).Razorpay({
                        description: res?.razorpay_options.description,
                        currency: res?.razorpay_options.currency,
                        amount: res?.razorpay_options.amount,
                        name: res?.razorpay_options.name,
                        order_id: res?.order_id,
                        prefill: {
                            name: res?.razorpay_options.prefill.name,
                            contact: res?.razorpay_options.prefill.contact,
                            email: res?.razorpay_options.prefill.email,
                        },
                        key: res?.razorpay_options.key,
                        theme: {
                            color: res?.razorpay_options.theme.color,
                        },
                        handler: function (response: any) {
                            const order_id = response.razorpay_order_id;
                            const payment_id = response.razorpay_payment_id;
                            fetch(
                                `${SERVER_URL}/payment/${
                                    transaction[TRANSACTION_STATUS.BUCKET_ID]
                                }/verify-payment`,
                                {
                                    method: "POST",
                                    body: JSON.stringify({
                                        order_id: order_id,
                                        payment_id: payment_id,
                                    }),
                                }
                            ).finally(() => {});
                        },
                    });

                    rzp1.open();
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            PaymentService.initiateRazorpay(
                transaction[TRANSACTION_STATUS.BUCKET_ID]
            )
                .then((res) => {
                    setLoading(false);
                    if (!res) {
                        setTransaction((prevState) => ({
                            ...prevState,
                            [TRANSACTION_STATUS.TRANSACTION_ERROR]:
                                "Unable to initiate payment",
                        }));
                    }
                    window.open(
                        res?.payment_link,
                        "_blank",
                        "rel=noopener noreferrer"
                    );
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err);
                });
        }
    };

    useInterval(() => {
        console.log("called");
        if (!transaction[TRANSACTION_STATUS.BUCKET_ID]) return;
        PaymentService.details(
            transaction[TRANSACTION_STATUS.BUCKET_ID],
            transaction[TRANSACTION_STATUS.TRANSACTION_ID]
        )
            .then((res) => {
                if (!res) return;
                setTransaction((prevState) => ({
                    ...prevState,
                    [TRANSACTION_STATUS.TRANSACTION_ERROR]: res.error,
                    [TRANSACTION_STATUS.STATUS]: res.status,
                }));
            })
            .catch((err) => {
                console.log(err);
            });
    }, 2000);

    return (
        <HStack pt={"2rem"} width={"full"} justifyContent={"space-around"}>
            <Box className="hidden md:block">
                <Image src={TRANSACTION} alt="Transaction" width={"350px"} />
            </Box>
            <Box
                rounded={"xl"}
                boxShadow={"0px 0px 10px 5px rgba(0,0,0,0.15)"}
                width={"90vw"}
                maxWidth={"600px"}
                p={"2rem"}
            >
                <Text
                    fontSize={"2xl"}
                    fontWeight={"medium"}
                    pb={"3rem"}
                    textAlign={"center"}
                >
                    Complete Your{" "}
                    <Box as="span" color={THEME.THEME_GREEN}>
                        Payment
                    </Box>
                </Text>
                <Stepper index={activeStep} size={"md"} colorScheme="green">
                    {steps.map((_, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>
                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
                <Flex direction={"column"} gap={"1rem"}>
                    <Details ref={detailsRef} isHidden={activeStep !== 0} />
                    <WANumber
                        ref={waNumbersRef}
                        plan_details={plan_details}
                        plan_name={plan_name as BILLING_PLANS_TYPE}
                        isHidden={activeStep !== 1}
                    />
                    <Billing ref={billingRef} isHidden={activeStep !== 2} />
                    {transaction[TRANSACTION_STATUS.STATUS] ? (
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
                                <Flex
                                    width={"full"}
                                    justifyContent={"space-between"}
                                >
                                    <Text className="text-black dark:text-white">
                                        Gross Amount
                                    </Text>
                                    <Text className="text-black dark:text-white">
                                        {
                                            transaction[
                                                TRANSACTION_STATUS.GROSS_AMOUNT
                                            ]
                                        }
                                    </Text>
                                </Flex>
                                <Flex
                                    width={"full"}
                                    justifyContent={"space-between"}
                                >
                                    <Text className="text-black dark:text-white">
                                        Tax
                                    </Text>
                                    <Text className="text-black dark:text-white">
                                        {transaction[TRANSACTION_STATUS.TAX]}
                                    </Text>
                                </Flex>
                                {COUPON_VALID ||
                                transaction[TRANSACTION_STATUS.DISCOUNT] ? (
                                    <Flex
                                        width={"full"}
                                        justifyContent={"space-between"}
                                    >
                                        <Text className="text-black dark:text-white">
                                            Discount
                                        </Text>
                                        <Text className="text-[#4CB072]">
                                            -
                                            {
                                                transaction[
                                                    TRANSACTION_STATUS.DISCOUNT
                                                ]
                                            }
                                        </Text>
                                    </Flex>
                                ) : null}
                                <Divider
                                    orientation="horizontal"
                                    my={"0.5rem"}
                                />
                                <Flex
                                    width={"full"}
                                    justifyContent={"space-between"}
                                    fontWeight={"semibold"}
                                >
                                    <Text className="text-black dark:text-white">
                                        Total Amount
                                    </Text>
                                    <Text className="text-[#4CB072]">
                                        {
                                            transaction[
                                                TRANSACTION_STATUS.TOTAL_AMOUNT
                                            ]
                                        }
                                    </Text>
                                </Flex>
                            </Box>

                            <Text
                                textColor="red.400"
                                textAlign={"center"}
                                fontWeight={"semibold"}
                                fontSize={"sm"}
                            >
                                {
                                    transaction[
                                        TRANSACTION_STATUS.TRANSACTION_ERROR
                                    ]
                                }
                            </Text>
                        </>
                    ) : null}
                    <HStack>
                        <Button
                            backgroundColor={THEME.THEME_GREEN}
                            color={"white"}
                            width={"full"}
                            _hover={{ backgroundColor: "green.500" }}
                            onClick={handleBack}
                            hidden={activeStep === 0}
                            isDisabled={loading}
                        >
                            Back
                        </Button>
                        <Button
                            backgroundColor={THEME.THEME_GREEN}
                            color={"white"}
                            width={"full"}
                            _hover={{ backgroundColor: "green.500" }}
                            onClick={handleNext}
                            isLoading={loading}
                        >
                            {activeStep === 2
                                ? "Submit & Pay"
                                : activeStep === 3
                                ? `Pay ${
                                      transaction[
                                          TRANSACTION_STATUS.TOTAL_AMOUNT
                                      ]
                                  }`
                                : "Next"}
                        </Button>
                    </HStack>
                </Flex>
            </Box>
        </HStack>
    );
};
export default PaymentPage;
