import {
    Box,
    Flex,
    HStack,
    Image,
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
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { TRANSACTION } from "../../../assets/Images";
import {
    BILLING_PLANS_DETAILS,
    BILLING_PLANS_TYPE,
    ROUTES,
    THEME,
} from "../../../utils/const";
import Billing from "./components/billing";
import Details from "./components/details";
import WaNumber from "./components/waNumber";

type WhatsappNumber = { country_code: string; phone_number: string };

const steps = [
    { title: "Personal Details" },
    { title: "Device Number" },
    { title: "Billing Details" },
];

const PaymentPage = () => {
    const { plan: plan_name } = useParams();

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const [error, setError] = useState({
        name: "",
        phone_number: "",
        email: "",
        whatsapp_number: "",
        billing_address: {
            street: "",
            city: "",
            district: "",
            state: "",
            pincode: "",
            country: "",
        },
    });

    const [userDetails, setUsersDetails] = useState({
        name: "",
        phone_number: "",
        email: "",
        billing_address: {
            street: "",
            city: "",
            district: "",
            state: "",
            pincode: "",
            country: "",
        },
    });

    const [whatsapp_numbers, setWhatsappNumbers] = useState<WhatsappNumber[]>(
        []
    );

    const {
        name,
        phone_number,
        billing_address: { city },
        billing_address: { country },
        billing_address: { district },
        billing_address: { pincode },
        billing_address: { state },
        billing_address: { street },
        email,
    } = userDetails;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError({
            ...error,
            name: "",
            phone_number: "",
            email: "",
            whatsapp_number: "",
            billing_address: {
                street: "",
                city: "",
                district: "",
                state: "",
                pincode: "",
                country: "",
            },
        });
        setUsersDetails((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (name === "") {
                setError({ ...error, name: "Name is required" });
                return;
            }
            if (email === "") {
                setError({ ...error, email: "Email is required" });
                return;
            }
            if (phone_number === "") {
                console.log(error);
                setError({
                    ...error,
                    phone_number: "Phone Number is required",
                });
                return;
            }
        }

        if (activeStep === 1) {
            if (whatsapp_numbers[0].phone_number.length < 10) {
                setError({
                    ...error,
                    whatsapp_number: "Whatsapp Number is required",
                });
                return;
            }
        }
        if (activeStep === 2) {
            if (street === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        street: "Street is required",
                    },
                });
                return;
            }
            if (city === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        city: "City is required",
                    },
                });
                return;
            }
            if (district === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        district: "District is required",
                    },
                });
                return;
            }
            if (state === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        state: "State is required",
                    },
                });
                return;
            }
            if (pincode === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        pincode: "Pincode is required",
                    },
                });
                return;
            }
            if (country === "") {
                setError({
                    ...error,
                    billing_address: {
                        ...error.billing_address,
                        country: "Country is required",
                    },
                });
                return;
            }
        }
        setActiveStep((prev) => prev + 1);
    };
    const handleChangeBillingAddress = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError({
            ...error,
            billing_address: {
                city: "",
                country: "",
                district: "",
                pincode: "",
                state: "",
                street: "",
            },
        });
        setUsersDetails((prev) => {
            return {
                ...prev,
                billing_address: {
                    ...prev.billing_address,
                    [e.target.name]: e.target.value,
                },
            };
        });
    };

    const updateWhatsappNumber = (
        index: number,
        type: keyof WhatsappNumber,
        value: string
    ) => {
        setError({
            ...error,
            name: "",
            phone_number: "",
            email: "",
            whatsapp_number: "",
            billing_address: {
                street: "",
                city: "",
                district: "",
                state: "",
                pincode: "",
                country: "",
            },
        });
        setWhatsappNumbers((prev) =>
            prev.map((item, arrIndex) => {
                if (index === arrIndex) {
                    item[type] = value;
                }
                return { ...item };
            })
        );
    };

    const getpincodeData = async () => {
        const data = await fetch(
            `https://api.postalpincode.in/pincode/${pincode}`
        );
        const dataJson = await data.json();
        console.log(dataJson);
        const { PostOffice } = dataJson[0];
        const { Message } = dataJson[0];
        console.log(Message);
        if (Message === "No records found") {
            setError({
                ...error,
                billing_address: {
                    ...error.billing_address,
                    pincode: "Invalid Pincode",
                },
            });
            return;
        }
        if (PostOffice.length === 0) {
            return null;
        }
        const { State, Country, District } = PostOffice[0];
        handleChangeBillingAddress({
            target: { name: "state", value: State },
        } as React.ChangeEvent<HTMLInputElement>);
        handleChangeBillingAddress({
            target: { name: "country", value: Country },
        } as React.ChangeEvent<HTMLInputElement>);
        handleChangeBillingAddress({
            target: { name: "district", value: District },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    useEffect(() => {
        const getData = setTimeout(() => {
            getpincodeData();
        }, 1000);
        return () => {
            clearTimeout(getData);
        };
    }, [pincode]);

    useEffect(() => {
        if (
            !Object.values(BILLING_PLANS_TYPE).includes(
                plan_name as unknown as BILLING_PLANS_TYPE
            )
        ) {
            return;
        }

        const plan_details =
            BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];
        const dummyData = Array.from(
            { length: plan_details.user_count },
            () => ({
                country_code: "91",
                phone_number: "",
            })
        ) as WhatsappNumber[];
        setWhatsappNumbers(dummyData);
    }, [plan_name]);

    if (
        !Object.values(BILLING_PLANS_TYPE).includes(
            plan_name as unknown as BILLING_PLANS_TYPE
        )
    ) {
        return <Navigate to={ROUTES.PRICING} />;
    }

    const plan_details = BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];

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
                    {steps.map((step, index) => (
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
                    {activeStep === 0 && (
                        <Details
                            name={name}
                            email={email}
                            phone_number={phone_number}
                            error={error}
                            handleChange={handleChange}
                            handleNext={handleNext}
                        />
                    )}
                    {activeStep === 1 && (
                        <WaNumber
                            whatsapp_numbers={whatsapp_numbers}
                            updateWhatsappNumber={updateWhatsappNumber}
                            plan_details={plan_details}
                            error={error}
                            handleBack={handleBack}
                            handleNext={handleNext}
                        />
                    )}
                    {activeStep === 2 && (
                        <Billing
                            handleChangeBillingAddress={
                                handleChangeBillingAddress
                            }
                            error={error.billing_address}
                            city={city}
                            country={country}
                            district={district}
                            pincode={pincode}
                            state={state}
                            street={street}
                            handleBack={handleBack}
                        />
                    )}
                </Flex>
            </Box>
        </HStack>
    );
};
export default PaymentPage;
