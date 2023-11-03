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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { TRANSACTION } from '../../../assets/Images';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE, ROUTES, THEME } from '../../../utils/const';
import Billing from './components/billing';
import Details from './components/details';
import WaNumber from './components/waNumber';

export type WhatsappNumber = { country_code: string; phone_number: string };

const steps = [
	{ title: 'Personal Details' },
	{ title: 'Device Number' },
	{ title: 'Billing Details' },
];

const userDetailsInit = {
	name: '',
	phone_number: '',
	email: '',
	whatsapp_number: '',
	type: '' as 'one-time' | 'subscription',
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

	const { activeStep, setActiveStep } = useSteps({
		index: 0,
		count: steps.length,
	});

	const [error, setError] = useState(userDetailsInit);

	const [userDetails, setUsersDetails] = useState(userDetailsInit);

	const [whatsapp_numbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);

	const [loading, setLoading] = useState(false);

	const {
		name,
		phone_number,
		email,
		type,
		billing_address: { city, country, district, pincode, state, street, gstin },
	} = userDetails;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(userDetailsInit);
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
			const [isValid, errors] = validatePersonalDetails(userDetails);
			if (!isValid && errors) {
				setError(errors);
				return;
			}
		}

		if (activeStep === 1) {
			const [isValid, errors] = validateWhatsappNumbers(whatsapp_numbers);
			if (!isValid && errors) {
				setError((prev) => ({
					...prev,
					whatsapp_number: errors,
				}));
				return;
			}
		}
		if (activeStep === 2) {
			const [isValid, errors] = validateBillingDetails(userDetails);
			if (!isValid && errors) {
				setError(errors);
				return;
			}
		}
		setActiveStep((prev) => prev + 1);
	};
	const handleChangeBillingAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(userDetailsInit);
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

	const updateWhatsappNumber = (index: number, type: keyof WhatsappNumber, value: string) => {
		setError(userDetailsInit);
		setWhatsappNumbers((prev) =>
			prev.map((item, arrIndex) => {
				if (index === arrIndex) {
					item[type] = value;
				}
				return { ...item };
			})
		);
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
		if (!Object.values(BILLING_PLANS_TYPE).includes(plan_name as unknown as BILLING_PLANS_TYPE)) {
			return;
		}

		const plan_details = BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];
		const dummyData = Array.from({ length: plan_details.user_count }, () => ({
			country_code: '91',
			phone_number: '',
		})) as WhatsappNumber[];
		setWhatsappNumbers(dummyData);
	}, [plan_name]);

	if (!Object.values(BILLING_PLANS_TYPE).includes(plan_name as unknown as BILLING_PLANS_TYPE)) {
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
