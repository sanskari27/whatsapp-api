/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
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
    useDisclosure,
    useSteps,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { TRANSACTION } from '../../../assets/Images';
import PaymentService from '../../../services/payment.service';
import {
    BILLING_PLANS_DETAILS,
    BILLING_PLANS_TYPE,
    ROUTES,
    THEME,
} from '../../../utils/const';
import { Billing, Checkout, Details, WANumber } from './components';
import { BillingRef } from './components/Billing';
import { CheckoutRef } from './components/Checkout';
import { DetailsRef } from './components/Details';
import { WANumbersRef } from './components/waNumber';

const steps = [
    { title: 'Personal Details' },
    { title: 'Device Number' },
    { title: 'Billing Details' },
    { title: 'Checkout' },
];

const userDetailsInit = {
    name: '',
    phone_number: '',
    email: '',
    type: 'one-time' as 'one-time' | 'subscription',
    whatsapp_number: '',
    billing_address: {
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        country: '',
        gstin: '',
    },
};

export type UserDetailsType = typeof userDetailsInit;

const PaymentPage = () => {
    const { plan: plan_name } = useParams();

    const navigate = useNavigate();

    const detailsRef = useRef<DetailsRef>(null);
    const waNumbersRef = useRef<WANumbersRef>(null);
    const billingRef = useRef<BillingRef>(null);
    const checkoutRef = useRef<CheckoutRef>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const {
        isOpen: isPaymentAlertOpen,
        onOpen: openPaymentComplete,
        onClose: onPaymentAlertClose,
    } = useDisclosure();
    const {
        isOpen: isSubscriptionAlertOpen,
        onOpen: onSubscriptionAlert,
        onClose: onSubscriptionAlertClose,
    } = useDisclosure();

    const [bucket_id, setBucketID] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        if (activeStep === 3) {
            checkoutRef.current?.resetCouponDetails();
        }
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
            initiateTransaction();
            return;
        } else if (activeStep === 3) {
            handlePaymentClick();
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const initiateTransaction = async () => {
        if (
            !detailsRef.current ||
            !waNumbersRef.current ||
            !billingRef.current
        ) {
            return;
        }
        if (plan_name === undefined) {
            return;
        }
        setLoading(true);

        const whatsapp_numbers = waNumbersRef.current
            .getData()
            .map((number) => `${number.country_code}${number.phone_number}`);

        const data = {
            ...detailsRef.current.getData(),
            plan_name: plan_name as BILLING_PLANS_TYPE,
            billing_address: billingRef.current.getData(),
            whatsapp_numbers,
            admin_number: whatsapp_numbers[0],
        };

        const result = await PaymentService.initiateTransaction(data);
        setLoading(false);
        if (!result) {
            return;
        }

        checkoutRef.current?.fetchTransactionDetails(
            result.bucket_id,
            detailsRef.current?.getData()?.type as 'one-time' | 'subscription'
        );
        setActiveStep(3);

        setBucketID(result.bucket_id);
    };

    const handlePaymentClick = async () => {
        setLoading(true);

        const result = await PaymentService.initiateRazorpay(bucket_id);

        if (!result) {
            setLoading(false);
            return;
        }

        if (
            detailsRef.current?.getData()?.type === 'one-time' &&
            result.razorpay_options
        ) {
            const rzp1 = new (window as any).Razorpay({
                ...result.razorpay_options,
                handler: function (response: any) {
                    const order_id = response.razorpay_order_id;
                    const payment_id = response.razorpay_payment_id;
                    PaymentService.verifyPayment(
                        bucket_id,
                        order_id,
                        payment_id
                    ).then(() => {
                        openPaymentComplete();
                    });
                },
            });

            rzp1.open();
        } else if (
            detailsRef.current?.getData()?.type === 'subscription' &&
            result.payment_link
        ) {
            window.open(result.payment_link, '_blank');
            onSubscriptionAlert();
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

    return (
        <HStack pt={'2rem'} width={'full'} justifyContent={'space-around'}>
            <Box className="hidden md:block">
                <Image src={TRANSACTION} alt="Transaction" width={'350px'} />
            </Box>
            <Box
                rounded={'xl'}
                boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
                width={'90vw'}
                maxWidth={'600px'}
                p={'2rem'}
            >
                <Text
                    fontSize={'2xl'}
                    fontWeight={'medium'}
                    pb={'3rem'}
                    textAlign={'center'}
                >
                    Complete Your{' '}
                    <Box as="span" color={THEME.THEME_GREEN}>
                        Payment
                    </Box>
                </Text>
                <Stepper index={activeStep} size={'md'} colorScheme="green">
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
                <Flex direction={'column'} gap={'1rem'}>
                    <Details ref={detailsRef} isHidden={activeStep !== 0} />
                    <WANumber
                        ref={waNumbersRef}
                        plan_details={plan_details}
                        plan_name={plan_name as BILLING_PLANS_TYPE}
                        isHidden={activeStep !== 1}
                    />
                    <Billing ref={billingRef} isHidden={activeStep !== 2} />
                    <Checkout ref={checkoutRef} isHidden={activeStep !== 3} />
                    <HStack>
                        <Button
                            backgroundColor={THEME.THEME_GREEN}
                            color={'white'}
                            width={'full'}
                            _hover={{ backgroundColor: 'green.500' }}
                            onClick={handleBack}
                            hidden={activeStep === 0}
                            isDisabled={loading}
                        >
                            Back
                        </Button>
                        <Button
                            backgroundColor={THEME.THEME_GREEN}
                            color={'white'}
                            width={'full'}
                            _hover={{ backgroundColor: 'green.500' }}
                            onClick={handleNext}
                            isLoading={loading}
                        >
                            {activeStep === 2
                                ? 'Checkout'
                                : activeStep === 3
                                ? `Confirm`
                                : 'Next'}
                        </Button>
                    </HStack>
                </Flex>
            </Box>
            <AlertDialog
                closeOnOverlayClick={false}
                motionPreset="slideInBottom"
                onClose={onPaymentAlertClose}
                isOpen={isPaymentAlertOpen}
                leastDestructiveRef={cancelRef}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Payment Successfull !</AlertDialogHeader>
                    <AlertDialogBody>
                        Your payment has been successfull. Please check your
                        email for the payment receipt.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="green"
                            ml={3}
                            onClick={() => {
                                navigate(ROUTES.HOME);
                            }}
                        >
                            Ok
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                closeOnOverlayClick={false}
                motionPreset="slideInBottom"
                onClose={onSubscriptionAlertClose}
                isOpen={isSubscriptionAlertOpen}
                leastDestructiveRef={cancelRef}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Alert !</AlertDialogHeader>
                    <AlertDialogBody>
                        Please proceed to the payment page to complete the
                        subscription. Your subscription will be activated once
                        the payment is successfull.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="green"
                            ml={3}
                            onClick={() => {
                                navigate(ROUTES.HOME);
                            }}
                        >
                            Ok
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </HStack>
    );
};
export default PaymentPage;
