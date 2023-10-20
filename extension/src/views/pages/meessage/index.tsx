import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Flex,
	Image,
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
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPORT_GREEN, MESSAGE } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import PaymentService from '../../../services/payment.service';
import LoginModal, { LoginHandle } from '../../components/login';
import NameSection from './components/NameSection';

export type SchedulerDetails = {
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL';
	numbers?: string[];
	csv_file: string;
	group_ids: string[];
	label_ids: string[];
	message?: string;
	variables?: string[];
	shared_contact_cards?: string[];
	attachments?: string[];
	campaign_name: string;
	min_delay: number;
	max_delay: number;
	startTime?: string;
	endTime?: string;
	batch_delay?: number;
	batch_size?: number;
};

const steps = ['Name', 'Message', 'Delay'];

const Message = () => {
	const navigate = useNavigate();
	const loginModelRef = useRef<LoginHandle>(null);

	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } = useAuth();
	useEffect(() => {
		if (!!qrGenerated) {
			loginModelRef.current?.open();
		} else {
			loginModelRef.current?.close();
		}
	}, [qrGenerated]);

	useEffect(() => {
		if (!isAuthenticated) return;
		PaymentService.isPaymentVerified().then((res) => {
			setUIDetails((prevState) => ({
				...prevState,
				paymentVerified: res.can_send_message,
			}));
		});
	}, [isAuthenticated]);

	const { activeStep, goToNext, goToPrevious } = useSteps({
		index: 1,
		count: 3,
	});
	const [details, setDetails] = useState<SchedulerDetails>({
		type: 'NUMBERS',
		numbers: [],
		csv_file: '',
		group_ids: [],
		label_ids: [],
		message: '',
		variables: [],
		shared_contact_cards: [],
		attachments: [],
		campaign_name: '',
		min_delay: 1,
		max_delay: 60,
		startTime: '00:00',
		endTime: '23:59',
		batch_delay: 120,
		batch_size: 10,
	});

	const [uiDetails, setUIDetails] = useState({
		recipientsLoading: false,
		paymentVerified: false,
		isBusiness: true,
		nameError: '',
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
	};

	const setSelectedRecipients = (ids: string[]) => {
		if (details.type === 'GROUP') {
			handleChange({ name: 'group_ids', value: ids });
		} else if (details.type === 'LABEL') {
			handleChange({ name: 'label_ids', value: ids });
		}
	};

	const handleNextClick = () => {
		if (activeStep < 3) {
			if (activeStep === 1) {
				if (!details.campaign_name) {
					setUIDetails((prev) => ({
						...prev,
						nameError: 'Campaign name required.',
					}));
					return;
				}
				if (
					!details.campaign_name ||
					!details.type ||
					!(details.csv_file || details.group_ids?.length > 0 || details.label_ids?.length > 0)
				) {
					setUIDetails((prev) => ({
						...prev,
						nameError: 'Recipients required.',
					}));
					return;
				}
			}
			goToNext();
		} else {
			scheduleMessage();
		}
	};

	const scheduleMessage = () => {};

	return (
		<Flex direction={'column'} gap={'0.5rem'}>
			<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
				<Image src={MESSAGE} width={4} alt='' />
				<Text className='text-black dark:text-white' fontSize='md'>
					Schedule Messages
				</Text>
			</Flex>

			<Stepper index={activeStep} size={'sm'} mx={'0.5rem'} colorScheme='green'>
				{steps.map((step, index) => (
					<Step key={index}>
						<StepIndicator>
							<StepStatus
								complete={<StepIcon />}
								incomplete={<StepNumber />}
								active={<StepNumber />}
							/>
						</StepIndicator>

						<Box flexShrink='0'>
							<StepTitle className='text-black dark:text-white'>{step}</StepTitle>
						</Box>

						<StepSeparator />
					</Step>
				))}
			</Stepper>
			<Box
				// className='bg-[#ECECEC] dark:bg-[#535353]'
				// px={'0.5rem'}
				borderRadius={'20px'}
			>
				<Flex flexDirection={'column'} gap={'0.5rem'} width={'full'}>
					{activeStep === 1 && (
						<NameSection
							handleChange={handleChange}
							type={details.type}
							setSelectedRecipients={setSelectedRecipients}
							error={uiDetails.nameError}
						/>
					)}
				</Flex>
			</Box>
			{!isAuthenticated ? (
				<Flex gap={'0.5rem'} direction={'column'}>
					<Text className='text-black text-center dark:text-white'>
						<InfoOutlineIcon marginRight={'0.25rem'} />
						Disclaimer: Please wait 5 minutes for contacts to sync after login.
					</Text>
					<Button
						bgColor={'blue.300'}
						_hover={{
							bgColor: 'blue.400',
						}}
						onClick={startAuth}
						isLoading={isAuthenticating}
					>
						<Flex gap={'0.5rem'}>
							<Text color={'white'}>Login</Text>
						</Flex>
					</Button>
				</Flex>
			) : !uiDetails.paymentVerified && activeStep === 3 ? (
				<Button
					bgColor={'yellow.400'}
					_hover={{
						bgColor: 'yellow.500',
					}}
					onClick={() => navigate(NAVIGATION.FEATURES)}
				>
					<Flex gap={'0.5rem'}>
						<Text color={'white'}>Subscribe</Text>
					</Flex>
				</Button>
			) : (
				<Flex justifyContent={'space-between'} alignItems={'center'}>
					{activeStep > 1 && (
						<Button
							bgColor={'yellow.300'}
							_hover={{
								bgColor: 'yellow.400',
							}}
							width={'48%'}
							onClick={goToPrevious}
						>
							<Text color={'white'}>Back</Text>
						</Button>
					)}
					<Button
						bgColor={'green.300'}
						_hover={{
							bgColor: 'green.400',
						}}
						width={activeStep > 1 ? '48%' : '100%'}
						onClick={handleNextClick}
						isLoading={uiDetails.recipientsLoading}
					>
						<Text color={'white'}>{activeStep === 3 ? 'Schedule' : 'Next'}</Text>
					</Button>
				</Flex>
			)}

			<LoginModal ref={loginModelRef} qr={qrCode} />
		</Flex>
	);
};

export default Message;
