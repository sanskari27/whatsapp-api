import {
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
	useSteps,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { TRANSACTION } from '../../../assets/Images';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE, ROUTES, THEME } from '../../../utils/const';
import { Billing, Details, WANumber } from './components';
import { BillingRef } from './components/Billing';
import { DetailsRef } from './components/Details';
import { WANumbersRef } from './components/WANumber';

const steps = [
	{ title: 'Personal Details' },
	{ title: 'Device Number' },
	{ title: 'Billing Details' },
];

const userDetailsInit = {
	name: '',
	phone_number: '',
	email: '',
	type: '' as 'one-time' | 'subscription',
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
	const detailsRef = useRef<DetailsRef>(null);
	const waNumbersRef = useRef<WANumbersRef>(null);
	const billingRef = useRef<BillingRef>(null);

	const { activeStep, setActiveStep } = useSteps({
		index: 0,
		count: steps.length,
	});

	const [loading, setLoading] = useState(false);

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};
	const handleNext = () => {
		if (!detailsRef.current || !waNumbersRef.current || !billingRef.current) {
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
		}
		setActiveStep((prev) => prev + 1);
	};

	const handleSubmit = () => {
		if (!detailsRef.current || !waNumbersRef.current || !billingRef.current) {
			return;
		}
		const data = {
			...detailsRef.current.getData(),
			...waNumbersRef.current.getData(),
			...billingRef.current.getData(),
		};
		console.log(data);

		setLoading(true);
	};

	if (!Object.values(BILLING_PLANS_TYPE).includes(plan_name as unknown as BILLING_PLANS_TYPE)) {
		return <Navigate to={ROUTES.PRICING} />;
	}

	const plan_details = BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];

	return (
		<HStack pt={'2rem'} width={'full'} justifyContent={'space-around'}>
			<Box className='hidden md:block'>
				<Image src={TRANSACTION} alt='Transaction' width={'350px'} />
			</Box>
			<Box
				rounded={'xl'}
				boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
				width={'90vw'}
				maxWidth={'600px'}
				p={'2rem'}
			>
				<Text fontSize={'2xl'} fontWeight={'medium'} pb={'3rem'} textAlign={'center'}>
					Complete Your{' '}
					<Box as='span' color={THEME.THEME_GREEN}>
						Payment
					</Box>
				</Text>
				<Stepper index={activeStep} size={'md'} colorScheme='green'>
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
							{activeStep === 2 ? 'Pay' : 'Next'}
						</Button>
					</HStack>
				</Flex>
			</Box>
		</HStack>
	);
};
export default PaymentPage;
