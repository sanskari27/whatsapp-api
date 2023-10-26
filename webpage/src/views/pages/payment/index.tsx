import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	Image,
	Input,
	InputGroup,
	InputLeftAddon,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PAYMENT } from '../../../assets/Images';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE, ROUTES, THEME } from '../../../utils/const';
import CountryCodeInput from '../../components/counrty-code-input';

type WhatsappNumber = { country_code: string; phone_number: string };

const PaymentPage = () => {
	const { plan: plan_name } = useParams();

	const [error, setError] = useState({
		name: '',
		phone_number: '',
	});

	const [userDetails, setUsersDetails] = useState({
		name: '',
		phone_number: '',
		billing_address: {
			street: '',
			city: '',
			district: '',
			state: '',
			pincode: '',
			country: '',
		},
	});

	const [whatsapp_numbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);

	const { name, phone_number, billing_address } = userDetails;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError({ ...error, name: '', phone_number: '' });
		setUsersDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};
	const handleChangeBillingAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError({ ...error, name: '', phone_number: '' });
		setFormData((prev) => {
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
		<VStack>
			<Text fontSize={'2xl'} fontWeight={'medium'} py={'3rem'}>
				Complete Your{' '}
				<Box as='span' color={THEME.THEME_GREEN}>
					Payment
				</Box>
			</Text>
			<Flex
				direction={'column'}
				gap={'1rem'}
				rounded={'xl'}
				boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
				width={'90vw'}
				maxWidth={'600px'}
				p={'2rem'}
			>
				<Image src={PAYMENT} alt={'Payment'} height={'100px'} mx={'auto'} />
				<FormControl isInvalid={!!error.name}>
					<Input
						backgroundColor={'#E8E8E8'}
						placeholder={'Enter Your Name'}
						isInvalid={!!error.name}
						value={name}
						onChange={handleChange}
						name='name'
					/>
					<Input
						backgroundColor={'#E8E8E8'}
						placeholder={'Enter Your Phone Number'}
						isInvalid={!!error.phone_number}
						value={phone_number}
						onChange={handleChange}
						name='phone'
					/>
					{whatsapp_numbers.map(({ country_code, phone_number }, index) => (
						<InputGroup key={index}>
							<InputLeftAddon
								width={'20%'}
								paddingX={0}
								children={
									<CountryCodeInput
										value={country_code}
										onChange={(text) => updateWhatsappNumber(index, 'country_code', text)}
									/>
								}
							/>
							<Input
								type='tel'
								backgroundColor={'#E8E8E8'}
								placeholder={`Whatsapp Number ${index + 1}`}
								value={phone_number}
								onChange={(e) => updateWhatsappNumber(index, 'phone_number', e.target.value)}
							/>
						</InputGroup>
					))}
					<Input
						backgroundColor={'#E8E8E8'}
						mb={'1rem'}
						defaultValue={plan_details.amount}
						disabled
					/>
					<Button
						backgroundColor={THEME.THEME_GREEN}
						color={'white'}
						width={'full'}
						_hover={{ backgroundColor: 'green.500' }}
						// onClick={handleSubmit}
					>
						Pay Now
					</Button>

					<FormErrorMessage>{`${error.name} ${error.phone_number}`}</FormErrorMessage>
				</FormControl>
			</Flex>
		</VStack>
	);
};
export default PaymentPage;
