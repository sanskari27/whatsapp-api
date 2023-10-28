import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Flex, Image, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { BACKGROUND } from '../../../assets/Images';
import { SERVER_URL } from '../../../utils/const';
import PageWrapper from '../../components/pageWrapper';

export default function InitiateRazorpayPayment() {
	//get url query params from react hook

	const [transactionCompleted, setTransactionCompleted] = useState(false);
	const { width, height } = useWindowSize();

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rzp1 = new (window as any).Razorpay({
			description: 'Subscription',
			currency: 'INR',
			amount: 177000,
			name: 'Whatsapp Helper',
			order_id: 'order_MthiouYutRZePB',
			prefill: {
				name: 'Sanskar',
				contact: '+917546027568',
				email: 'sanskarkumar85111@gmail.com',
			},
			key: 'rzp_test_Rg8iE2lEXgIdd3',
			theme: {
				color: '#4CB072',
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			handler: function (response: any) {
				const order_id = response.razorpay_order_id;
				const payment_id = response.razorpay_payment_id;
				fetch(`${SERVER_URL}/payment/653d2321b67b62260150d8af/verify-payment`, {
					method: 'POST',
					body: JSON.stringify({
						order_id: order_id,
						payment_id: payment_id,
					}),
				}).finally(() => {
					setTransactionCompleted(true);
				});
			},
		});

		rzp1.open();
	}, []);

	if (!transactionCompleted) return <></>;

	return (
		<PageWrapper>
			<Confetti width={width} height={height} />
			<Flex direction={'column'} mt={'auto'} justifyContent={'space-between'}>
				<VStack alignItems='center' justifyContent='center' my='auto' spacing={4}>
					<Flex bg='#4CB07266' alignItems='center' py='0.7rem' px='2.5rem' rounded='lg'>
						<InfoOutlineIcon mr='10px' color='#235C39' />{' '}
						<Text color='#235C39' className='text-sm md:text-lg'>
							Your Transaction has been completed
						</Text>
					</Flex>
					<Flex>
						<Text fontWeight='bold'>Open our extension to see the changes!!</Text>
					</Flex>
				</VStack>
				<Image src={BACKGROUND} alt='Payment Success' />
			</Flex>
		</PageWrapper>
	);
}
