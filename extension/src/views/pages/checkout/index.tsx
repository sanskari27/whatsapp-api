import { Box, Button, Divider, Flex, HStack, Image, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { COUPON } from '../../../assets/Images';
import { CHROME_ACTION, TRANSACTION_STATUS, WEBPAGE_URL } from '../../../config/const';
import BackButton from '../../components/back-button';
import { CouponBanner } from './components';
import { CheckIcon, CloseIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { useLocation, useParams } from 'react-router-dom';
import PaymentService from '../../../services/payment.service';
import { getActiveTabURL, getClientID } from '../../../utils/ChromeUtils';
import { MessageProps } from '../../../background/background';

const CheckoutPage = () => {
	const [transaction, setTransaction] = useState({
		[TRANSACTION_STATUS.CODE]: '',
		[TRANSACTION_STATUS.CHECKING_COUPON]: false,
		[TRANSACTION_STATUS.COUPON_VALID]: false,
		[TRANSACTION_STATUS.COUPON_ERROR]: '',
		[TRANSACTION_STATUS.TRANSACTION_ID]: '',
		[TRANSACTION_STATUS.GROSS_AMOUNT]: '',
		[TRANSACTION_STATUS.TAX]: '',
		[TRANSACTION_STATUS.DISCOUNT]: '',
		[TRANSACTION_STATUS.TOTAL_AMOUNT]: '',
		[TRANSACTION_STATUS.TRANSACTION_ERROR]: '',
	});
	const location = useLocation();

	const { CODE, COUPON_VALID, COUPON_ERROR, CHECKING_COUPON } = transaction;

	useEffect(() => {
		if (!location.state) return;
		setTransaction((prevState) => ({
			...prevState,
			[TRANSACTION_STATUS.TRANSACTION_ID]: location.state[TRANSACTION_STATUS.TRANSACTION_ID],
			[TRANSACTION_STATUS.GROSS_AMOUNT]: location.state[TRANSACTION_STATUS.GROSS_AMOUNT],
			[TRANSACTION_STATUS.TAX]: location.state[TRANSACTION_STATUS.TAX],
			[TRANSACTION_STATUS.DISCOUNT]: location.state[TRANSACTION_STATUS.DISCOUNT],
			[TRANSACTION_STATUS.TOTAL_AMOUNT]: location.state[TRANSACTION_STATUS.TOTAL_AMOUNT],
		}));
	}, [location.state]);

	const handleApplyCoupon = (CODE: string) => {
		if (COUPON_VALID) {
			PaymentService.removeCoupon(transaction[TRANSACTION_STATUS.TRANSACTION_ID]).then((res) => {
				if (!res) {
					setTransaction((prevState) => ({
						...prevState,
						[TRANSACTION_STATUS.COUPON_ERROR]: 'Unable to remove coupon',
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
					[TRANSACTION_STATUS.CODE]: '',
					[TRANSACTION_STATUS.COUPON_VALID]: false,
				}));
			});
		} else if (COUPON_ERROR) {
			setTransaction((prevState) => ({
				...prevState,
				[TRANSACTION_STATUS.CODE]: '',
				[TRANSACTION_STATUS.COUPON_ERROR]: '',
			}));
		} else {
			PaymentService.applyCoupon(transaction[TRANSACTION_STATUS.TRANSACTION_ID], CODE).then(
				(res) => {
					if (!res) {
						setTransaction((prevState) => ({
							...prevState,
							[TRANSACTION_STATUS.COUPON_ERROR]: 'Invalid Coupon Code',
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
				}
			);
		}
	};

	const handleChange = async ({ name, value }: { name: string; value: string | boolean }) => {
		setTransaction((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handlePaymentClick = async () => {
		const paymentTransaction = await PaymentService.initiateRazorpay(
			transaction[TRANSACTION_STATUS.TRANSACTION_ID]
		);
		if (!paymentTransaction) return;
		const activeTab = await getActiveTabURL();
		const client_id = await getClientID();
		const message: MessageProps = {
			action: CHROME_ACTION.OPEN_URL,
			tabId: activeTab.id,
			url: activeTab.url,
			data: {
				url:
					WEBPAGE_URL +
					'api/razorpay/initiate-payment?' +
					new URLSearchParams({
						currency: paymentTransaction.razorpay_options.currency,
						name: paymentTransaction.razorpay_options.name,
						description: paymentTransaction.razorpay_options.description,
						order_id: paymentTransaction.razorpay_options.order_id,
						transaction_id: paymentTransaction.transaction_id,
						client_id: client_id,
					}).toString(),
			},
		};
		await chrome.runtime.sendMessage(message);
	};

	return (
		<Flex direction={'column'} padding={'1rem'}>
			<BackButton />
			<Text className='text-[#4CB072]' fontWeight={'semibold'} fontSize={'md'} mt={'0.5rem'}>
				Coupon
			</Text>
			<HStack
				backgroundColor={'green.500'}
				rounded={'md'}
				py={'0.5rem'}
				pl={'1rem'}
				mt={'1rem'}
				mb='0.5rem'
			>
				<Image src={COUPON} alt='' width={'2rem'} />
				<Input
					variant={'unstyled'}
					textColor={'white'}
					textAlign={'center'}
					value={CODE}
					placeholder={'Enter Coupon Code'}
					_placeholder={{
						color: 'gray.200',
					}}
					isDisabled={COUPON_VALID && !!CODE}
					onChange={(e) =>
						handleChange({ name: TRANSACTION_STATUS.CODE, value: e.target.value.toUpperCase() })
					}
				/>

				<Button
					variant={'link'}
					onClick={() => handleApplyCoupon(CODE)}
					isDisabled={!CODE}
					isLoading={CHECKING_COUPON}
				>
					{COUPON_VALID ? (
						<CloseIcon color={'gray.400'} height='1rem' width={'1rem'} />
					) : COUPON_ERROR ? (
						<WarningTwoIcon color={'red.400'} height='1rem' width={'1rem'} />
					) : (
						<CheckIcon color={'white'} height='1rem' width={'1rem'} />
					)}
				</Button>
			</HStack>
			<CouponBanner
				isChecked={CODE === 'WELCOME'}
				onClick={() => {
					handleChange({ name: TRANSACTION_STATUS.CODE, value: 'WELCOME' });
					handleApplyCoupon('WELCOME');
				}}
			>
				Welcome - 40% off
			</CouponBanner>
			<Text
				textColor='red.400'
				fontWeight={'semibold'}
				fontSize={'sm'}
				mt={'0.5rem'}
				alignSelf={'flex-end'}
			>
				{COUPON_ERROR}
			</Text>
			<Box
				className='bg-[#ECECEC] dark:bg-[#535353]'
				p={'1rem'}
				borderRadius={'10px'}
				mt={'0.5rem'}
			>
				<Flex width={'full'} justifyContent={'space-between'}>
					<Text className='text-black dark:text-white'>Gross Amount</Text>
					<Text className='text-black dark:text-white'>
						{transaction[TRANSACTION_STATUS.GROSS_AMOUNT]}
					</Text>
				</Flex>
				{COUPON_VALID || transaction[TRANSACTION_STATUS.DISCOUNT] ? (
					<Flex width={'full'} justifyContent={'space-between'}>
						<Text className='text-black dark:text-white'>Discount</Text>
						<Text className='text-[#4CB072]'>-{transaction[TRANSACTION_STATUS.DISCOUNT]}</Text>
					</Flex>
				) : null}
				<Divider orientation='horizontal' my={'0.5rem'} />
				<Flex width={'full'} justifyContent={'space-between'} fontWeight={'semibold'}>
					<Text className='text-black dark:text-white'>Total Amount</Text>
					<Text className='text-[#4CB072]'>{transaction[TRANSACTION_STATUS.TOTAL_AMOUNT]}</Text>
				</Flex>
			</Box>

			<Text textColor='red.400' textAlign={'center'} fontWeight={'semibold'} fontSize={'sm'}>
				{transaction[TRANSACTION_STATUS.TRANSACTION_ERROR]}
			</Text>

			<Button
				width={'auto'}
				my={'0.5rem'}
				backgroundColor={'green.400'}
				textColor={'white'}
				_hover={{
					backgroundColor: 'green.500',
				}}
				onClick={handlePaymentClick}
			>
				<Text fontWeight={'semibold'} fontSize={'xl'}>
					Pay {transaction[TRANSACTION_STATUS.TOTAL_AMOUNT]}
				</Text>
			</Button>
		</Flex>
	);
};

export default CheckoutPage;
