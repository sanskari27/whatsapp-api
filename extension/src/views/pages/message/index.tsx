import { InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    Icon,
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Text,
    useSteps,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { BiMessageSquareDetail } from "react-icons/bi";
import { MessageProps } from "../../../background/background";
import { CHROME_ACTION } from "../../../config/const";
import { startAuth, useAuth } from "../../../hooks/useAuth";
import AuthService from "../../../services/auth.service";
import MessageService from "../../../services/message.service";
import { getActiveTabURL } from "../../../utils/ChromeUtils";
import LoginModal, { LoginHandle } from "../../components/login";
import DelaySection from "./components/DelaySection";
import MessageSection from "./components/MessageSection";
import NameSection from "./components/NameSection";

export type SchedulerDetails = {
    type: "NUMBERS" | "CSV" | "GROUP" | "LABEL";
    numbers?: string[];
    csv_file: string;
    group_ids: string[];
    label_ids: string[];
    message: string;
    variables: string[];
    shared_contact_cards: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }[];
    attachments: string[];
    campaign_name: string;
    min_delay: number;
    max_delay: number;
    startTime: string;
    endTime: string;
    batch_delay: number;
    batch_size: number;
};

const steps = ["Name", "Message", "Delay"];

const Message = () => {
    const loginModelRef = useRef<LoginHandle>(null);

    const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } =
        useAuth();
    useEffect(() => {
        if (!!qrGenerated) {
            loginModelRef.current?.open();
        } else {
            loginModelRef.current?.close();
        }
    }, [qrGenerated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        AuthService.getUserDetails().then((res) => {
            setUIDetails((prevState) => ({
                ...prevState,
                isBusiness: res.userType === "BUSINESS",
                paymentVerified: res.canSendMessage,
            }));
        });
    }, [isAuthenticated]);

    const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
        index: 1,
        count: 3,
    });
    const [details, setDetails] = useState<SchedulerDetails>({
        type: "NUMBERS",
        numbers: [],
        csv_file: "",
        group_ids: [],
        label_ids: [],
        message: "",
        variables: [],
        shared_contact_cards: [],
        attachments: [],
        campaign_name: "",
        min_delay: 1,
        max_delay: 60,
        startTime: "00:00",
        endTime: "23:59",
        batch_delay: 120,
        batch_size: 10,
    });

    const [uiDetails, setUIDetails] = useState({
        recipientsLoading: false,
        paymentVerified: false,
        schedulingMessages: false,
        isBusiness: true,
        nameError: "",
        messageError: "",
        delayError: "",
        apiError: "",
    });

    const handleChange = async ({
        name,
        value,
    }: {
        name: keyof SchedulerDetails;
        value: (typeof details)[keyof SchedulerDetails];
    }) => {
        setDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setUIDetails((prevState) => ({
            ...prevState,
            nameError: "",
            messageError: "",
        }));
    };

    const setSelectedRecipients = (ids: string[]) => {
        if (details.type === "GROUP") {
            handleChange({ name: "group_ids", value: ids });
        } else if (details.type === "LABEL") {
            handleChange({ name: "label_ids", value: ids });
        }
    };

    const handleNextClick = () => {
        if (activeStep >= 3) {
            scheduleMessage();
            return;
        }
        if (activeStep === 1) {
            if (!details.campaign_name) {
                setUIDetails((prev) => ({
                    ...prev,
                    nameError: "Campaign name required.",
                }));
                return;
            }
            let isError = false;
            if (!details.type) {
                isError = true;
            } else if (details.type === "CSV" && !details.csv_file) {
                isError = true;
            } else if (
                details.type === "GROUP" &&
                details.group_ids.length === 0
            ) {
                isError = true;
            } else if (
                details.type === "LABEL" &&
                details.label_ids.length === 0
            ) {
                isError = true;
            }

            if (isError) {
                setUIDetails((prev) => ({
                    ...prev,
                    nameError: "Recipients required.",
                }));
                return;
            }
        }
        if (activeStep === 2) {
            if (!details.message && details.attachments.length === 0) {
                setUIDetails((prev) => ({
                    ...prev,
                    messageError: "Message or attachment required.",
                }));
                return;
            }
        }
        if (activeStep === 3) {
            if (!details.min_delay && details.max_delay === 0) {
                setUIDetails((prev) => ({
                    ...prev,
                    messageError: "Delay required.",
                }));
                return;
            }
            scheduleMessage();
            return;
        }
        goToNext();
    };

    const addContact = (data: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => {
        setDetails((prevState) => ({
            ...prevState,
            shared_contact_cards: [
                ...prevState.shared_contact_cards,
                {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    middle_name: data.middle_name,
                    organization: data.organization,
                    email_personal: data.email_personal,
                    email_work: data.email_work,
                    contact_number_phone: data.contact_number_phone,
                    contact_number_work: data.contact_number_work,
                    contact_number_other: data.contact_number_other,
                    links: data.links,
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                },
            ],
        }));
    };

    const removeContact = (contact: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => {
        setDetails((prevState) => ({
            ...prevState,
            shared_contact_cards: prevState.shared_contact_cards.filter(
                (data) => data !== contact
            ),
        }));
    };

    const scheduleMessage = () => {
        setUIDetails((prev) => ({
            ...prev,
            schedulingMessages: true,
        }));
        MessageService.scheduleMessage(details).then((success) => {
            if (!success) {
                setUIDetails((prev) => ({
                    ...prev,
                    apiError: "Unable to schedule messages",
                    schedulingMessages: false,
                }));
                return;
            }
            setActiveStep(1);
            setDetails({
                type: "NUMBERS",
                numbers: [],
                csv_file: "",
                group_ids: [],
                label_ids: [],
                message: "",
                variables: [],
                shared_contact_cards: [],
                attachments: [],
                campaign_name: "",
                min_delay: 1,
                max_delay: 60,
                startTime: "00:00",
                endTime: "23:59",
                batch_delay: 120,
                batch_size: 10,
            });
            setUIDetails((prev) => ({
                recipientsLoading: false,
                paymentVerified: prev.paymentVerified,
                schedulingMessages: false,
                isBusiness: prev.isBusiness,
                nameError: "",
                messageError: "",
                delayError: "",
                apiError: "",
            }));
        });
    };

    const handleSubscription = async () => {
        const activeTab = await getActiveTabURL();
        const message: MessageProps = {
            action: CHROME_ACTION.OPEN_URL,
            tabId: activeTab.id,
            url: activeTab.url,
            data: {
                url: "https://whatsleads.in/pricing",
            },
        };
        await chrome.runtime.sendMessage(message);
    };

    return (
        <Flex
            direction={"column"}
            gap={"0.5rem"}
            justifyContent={"space-between"}
            height={"full"}
        >
            <Flex direction={"column"} gap={"0.5rem"}>
                <Flex alignItems="center" gap={"0.5rem"} mt={"1.5rem"}>
                    <Icon
                        as={BiMessageSquareDetail}
                        height={5}
                        width={5}
                        color={"green.400"}
                    />
                    <Text className="text-black dark:text-white" fontSize="md">
                        Schedule Messages
                    </Text>
                </Flex>

                <Stepper
                    index={activeStep}
                    size={"sm"}
                    mx={"0.5rem"}
                    colorScheme="green"
                >
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>

                            <Box flexShrink="0">
                                <StepTitle className="text-gray-700 dark:text-gray-400">
                                    {step}
                                </StepTitle>
                            </Box>

                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
                <Box
                    // className='bg-[#ECECEC] dark:bg-[#535353]'
                    // px={'0.5rem'}
                    borderRadius={"20px"}
                    mb={"1rem"}
                >
                    <Flex
                        flexDirection={"column"}
                        gap={"0.5rem"}
                        width={"full"}
                    >
                        <NameSection
                            handleChange={handleChange}
                            type={details.type}
                            details={details}
                            setSelectedRecipients={setSelectedRecipients}
                            error={uiDetails.nameError}
                            isBusiness={uiDetails.isBusiness}
                            isDisabled={
                                !isAuthenticated || !uiDetails.paymentVerified
                            }
                            isHidden={activeStep !== 1}
                        />
                        <MessageSection
                            handleChange={handleChange}
                            details={details}
                            type={details.type}
                            error={uiDetails.messageError}
                            isHidden={activeStep !== 2}
                            addContact={addContact}
                            removeContact={removeContact}
                        />
                        <DelaySection
                            handleChange={handleChange}
                            details={details}
                            error={uiDetails.delayError}
                            isHidden={activeStep !== 3}
                        />
                    </Flex>
                </Box>
            </Flex>

            {uiDetails.apiError && (
                <Text mt={-2} color="red.400" textAlign={"center"}>
                    <InfoIcon /> {uiDetails.apiError}
                </Text>
            )}

            {!isAuthenticated ? (
                <Flex gap={"0.5rem"} direction={"column"}>
                    <Text className="text-black text-center dark:text-white">
                        <InfoOutlineIcon marginRight={"0.25rem"} />
                        Disclaimer: Please wait 5 minutes for contacts to sync
                        after login.
                    </Text>
                    <Button
                        bgColor={"blue.300"}
                        _hover={{
                            bgColor: "blue.400",
                        }}
                        onClick={startAuth}
                        isLoading={isAuthenticating}
                    >
                        <Flex gap={"0.5rem"}>
                            <Text color={"white"}>Login</Text>
                        </Flex>
                    </Button>
                </Flex>
            ) : !uiDetails.paymentVerified && activeStep === 1 ? (
                <Button
                    bgColor={"yellow.400"}
                    _hover={{
                        bgColor: "yellow.500",
                    }}
                    onClick={handleSubscription}
                >
                    <Flex gap={"0.5rem"}>
                        <Text color={"white"}>Subscribe</Text>
                    </Flex>
                </Button>
            ) : (
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                    {activeStep > 1 && (
                        <Button
                            bgColor={"yellow.300"}
                            _hover={{
                                bgColor: "yellow.400",
                            }}
                            width={"48%"}
                            onClick={goToPrevious}
                        >
                            <Text color={"white"}>Back</Text>
                        </Button>
                    )}
                    <Button
                        bgColor={"green.300"}
                        _hover={{
                            bgColor: "green.400",
                        }}
                        width={activeStep > 1 ? "48%" : "100%"}
                        onClick={handleNextClick}
                        isLoading={
                            uiDetails.recipientsLoading ||
                            uiDetails.schedulingMessages
                        }
                        isDisabled={!isAuthenticated}
                    >
                        <Text color={"white"}>
                            {activeStep === 3 ? "Schedule" : "Next"}
                        </Text>
                    </Button>
                </Flex>
            )}

            <LoginModal ref={loginModelRef} qr={qrCode} />
        </Flex>
    );
};

export default Message;
