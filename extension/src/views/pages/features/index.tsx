import { Button } from '@chakra-ui/button';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { useNavigate } from 'react-router';
import { NAVIGATION, TRANSACTION_STATUS } from '../../../config/const';
import BackButton from '../../components/back-button';
import PaymentService from '../../../services/payment.service';
import { useCallback, useEffect, useState } from 'react';
import { getTransactionData, saveTransactionData } from '../../../utils/ChromeUtils';

const Features = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [transactionData, setTransactionData] = useState<{
		[TRANSACTION_STATUS.TRANSACTION_ID]: string;
		[TRANSACTION_STATUS.GROSS_AMOUNT]: string;
		[TRANSACTION_STATUS.TAX]: string;
		[TRANSACTION_STATUS.DISCOUNT]: string;
		[TRANSACTION_STATUS.TOTAL_AMOUNT]: string;
	} | null>(null);

	const fetchTransactionDetails = useCallback(async () => {
		const transaction_id = await getTransactionData();
		if (!transaction_id) {
			return;
		}
		setLoading(true);
		PaymentService.details(transaction_id)
			.then((res) => {
				if (!res) {
					return;
				}
				if (res.status !== 'pending') {
					return;
				}
				setTransactionData({
					[TRANSACTION_STATUS.TRANSACTION_ID]: res.transaction_id,
					[TRANSACTION_STATUS.GROSS_AMOUNT]: res.gross_amount,
					[TRANSACTION_STATUS.TAX]: res.tax,
					[TRANSACTION_STATUS.DISCOUNT]: res.discount,
					[TRANSACTION_STATUS.TOTAL_AMOUNT]: res.total_amount,
				});
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		fetchTransactionDetails();
	}, [fetchTransactionDetails]);

	const handlePayClick = () => {
		if (transactionData) {
			navigate(NAVIGATION.CHECKOUT, {
				state: transactionData,
			});
			return;
		}
		setLoading(true);
		PaymentService.initiateTransaction().then((res) => {
			if (!res) {
				setError("Couldn't initiate transaction");
				setLoading(false);
				return;
			}
			saveTransactionData(res.transaction_id);
			navigate(NAVIGATION.CHECKOUT, {
				state: {
					[TRANSACTION_STATUS.TRANSACTION_ID]: res.transaction_id,
					[TRANSACTION_STATUS.GROSS_AMOUNT]: res.gross_amount,
					[TRANSACTION_STATUS.TAX]: res.tax,
					[TRANSACTION_STATUS.DISCOUNT]: res.discount,
					[TRANSACTION_STATUS.TOTAL_AMOUNT]: res.total_amount,
				},
			});
		});
	};

	return (
		<Flex direction={'column'} padding={'1rem'}>
			<BackButton />

			<Text className='text-black dark:text-white' mt={'0.5rem'} fontSize={'lg'}>
				Features Included In
			</Text>
			<Text className='text-black dark:text-white' fontSize={'lg'}>
				The Package
			</Text>
			<Flex alignItems={'center'} mt={'1rem'}>
				<Box as='span' height={'2px'} width={'20px'} backgroundColor={'green.500'} mr={'0.5rem'} />
				<Text className='text-black dark:text-white' fontSize={'md'}>
					80% customers don't save you number
				</Text>
			</Flex>
			<Flex alignItems={'center'}>
				<Box as='span' height={'2px'} width={'20px'} backgroundColor={'green.500'} mr={'0.5rem'} />
				<Text className='text-black dark:text-white' fontSize={'md'}>
					Find unsaved Client to Grow your Business
				</Text>
			</Flex>
			<Flex alignItems={'center'}>
				<Box as='span' height={'2px'} width={'20px'} backgroundColor={'green.500'} mr={'0.5rem'} />
				<Text className='text-black dark:text-white' fontSize={'md'}>
					Find 1000s of contacts from Group
				</Text>
			</Flex>
			<Flex alignItems={'flex-start'}>
				<Box
					as='span'
					height={'2px'}
					width={'20px'}
					backgroundColor={'green.500'}
					mr={'0.5rem'}
					mt={'0.8rem'}
				/>
				<Text className='text-black dark:text-white' width={'90%'} fontSize={'md'}>
					Pay once and download unlimited times for a month
				</Text>
			</Flex>
			<Text textAlign='left' fontSize='sm' textColor='red.500' mt={'4.5rem'}>
				{error}
			</Text>
			<Button
				width={'full'}
				backgroundColor={'green.400'}
				textColor={'white'}
				mt={'0.5rem'}
				position={'relative'}
				onClick={handlePayClick}
				isLoading={loading}
				_hover={{ backgroundColor: 'green.500' }}
			>
				Proceed to pay
			</Button>
		</Flex>
	);
};
export default Features;
