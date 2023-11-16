import { CheckIcon, CloseIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { Box, Button, Divider, Flex, HStack, Input, Text } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import PaymentService from '../../../../services/payment.service';
import { THEME, TRANSACTION_DETAIL } from '../../../../utils/const';

type CheckoutProps = {
	isHidden: boolean;
	onDataChanged?: () => void;
};

export interface CheckoutRef {
	resetCouponDetails: () => void;
	fetchTransactionDetails: (bucket_id: string, type: 'one-time' | 'subscription') => Promise<void>;
}

const Checkout = forwardRef<CheckoutRef, CheckoutProps>(
	({ isHidden, onDataChanged = () => {} }: CheckoutProps, ref) => {
		const [CODE, setCoupon] = useState('');
		const [bucket_id, setBucketID] = useState('');
		const [type, setType] = useState('');

		const [transaction, setTransaction] = useState({
			[TRANSACTION_DETAIL.BUCKET_ID]: '',
			[TRANSACTION_DETAIL.TRANSACTION_ID]: '',
			[TRANSACTION_DETAIL.GROSS_AMOUNT]: '',
			[TRANSACTION_DETAIL.TAX]: '',
			[TRANSACTION_DETAIL.DISCOUNT]: '',
			[TRANSACTION_DETAIL.TOTAL_AMOUNT]: '',
		});

		const [coupon_error, setCouponError] = useState({
			[TRANSACTION_DETAIL.COUPON_ERROR]: '',
			[TRANSACTION_DETAIL.COUPON_VALID]: false,
			[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
		});

		const { CHECKING_COUPON, COUPON_VALID, COUPON_ERROR } = coupon_error;

		const handleCoupon = async () => {
			onDataChanged();
			if (COUPON_VALID) {
				const result = await PaymentService.removeCoupon(transaction[TRANSACTION_DETAIL.BUCKET_ID]);
				if (!result) {
					return;
				}
				setCoupon('');
				setCouponError({
					[TRANSACTION_DETAIL.COUPON_VALID]: false,
					[TRANSACTION_DETAIL.COUPON_ERROR]: '',
					[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
				});

				setTransaction({
					[TRANSACTION_DETAIL.BUCKET_ID]: result.bucket_id,
					[TRANSACTION_DETAIL.TRANSACTION_ID]: result.transaction_id,
					[TRANSACTION_DETAIL.GROSS_AMOUNT]: result.gross_amount,
					[TRANSACTION_DETAIL.TAX]: result.tax,
					[TRANSACTION_DETAIL.DISCOUNT]: result.discount,
					[TRANSACTION_DETAIL.TOTAL_AMOUNT]: result.total_amount,
				});
			} else if (COUPON_ERROR) {
				setCoupon('');
				setCouponError({
					[TRANSACTION_DETAIL.COUPON_VALID]: false,
					[TRANSACTION_DETAIL.COUPON_ERROR]: '',
					[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
				});
			} else {
				setCouponError((prev) => ({
					...prev,
					[TRANSACTION_DETAIL.CHECKING_COUPON]: true,
				}));
				const result = await PaymentService.applyCoupon(bucket_id, CODE);
				if (!result) {
					setCouponError({
						[TRANSACTION_DETAIL.COUPON_VALID]: false,
						[TRANSACTION_DETAIL.COUPON_ERROR]: 'Invalid Coupon Code',
						[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
					});
					return;
				}
				setTransaction({
					[TRANSACTION_DETAIL.BUCKET_ID]: result.bucket_id,
					[TRANSACTION_DETAIL.TRANSACTION_ID]: result.transaction_id,
					[TRANSACTION_DETAIL.GROSS_AMOUNT]: result.gross_amount,
					[TRANSACTION_DETAIL.TAX]: result.tax,
					[TRANSACTION_DETAIL.DISCOUNT]: result.discount,
					[TRANSACTION_DETAIL.TOTAL_AMOUNT]: result.total_amount,
				});
				setCouponError({
					[TRANSACTION_DETAIL.COUPON_VALID]: true,
					[TRANSACTION_DETAIL.COUPON_ERROR]: '',
					[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
				});
			}
		};

		useImperativeHandle(
			ref,
			() => {
				return {
					resetCouponDetails: () => {
						setCoupon('');
						setCouponError({
							[TRANSACTION_DETAIL.COUPON_VALID]: false,
							[TRANSACTION_DETAIL.COUPON_ERROR]: '',
							[TRANSACTION_DETAIL.CHECKING_COUPON]: false,
						});
						setTransaction({
							[TRANSACTION_DETAIL.BUCKET_ID]: '',
							[TRANSACTION_DETAIL.TRANSACTION_ID]: '',
							[TRANSACTION_DETAIL.GROSS_AMOUNT]: '',
							[TRANSACTION_DETAIL.TAX]: '',
							[TRANSACTION_DETAIL.DISCOUNT]: '',
							[TRANSACTION_DETAIL.TOTAL_AMOUNT]: '',
						});
					},
					fetchTransactionDetails: async (bucket_id: string, type) => {
						setBucketID(bucket_id);
						const result = await PaymentService.details(bucket_id);
						if (!result) {
							return;
						}
						setType(type);
						setTransaction({
							[TRANSACTION_DETAIL.BUCKET_ID]: result.bucket_id,
							[TRANSACTION_DETAIL.TRANSACTION_ID]: result.transaction_id,
							[TRANSACTION_DETAIL.GROSS_AMOUNT]: result.gross_amount,
							[TRANSACTION_DETAIL.TAX]: result.tax,
							[TRANSACTION_DETAIL.DISCOUNT]: result.discount,
							[TRANSACTION_DETAIL.TOTAL_AMOUNT]: result.total_amount,
						});
					},
				};
			},
			[]
		);

		return (
			<Box hidden={isHidden}>
				{type === 'one-time' ? (
					<>
						<Text fontSize={'2xl'} fontWeight={'medium'} textAlign={'center'}>
							Have A
							<Box as='span' color={THEME.THEME_GREEN} ml={'0.25rem'}>
								Coupon?
							</Box>
						</Text>
						<HStack
							backgroundColor={'green.500'}
							rounded={'md'}
							py={'0.5rem'}
							pl={'1rem'}
							mt={'1rem'}
							mb='0.5rem'
						>
							{/* <Image src={COUPON} alt="" width={"2rem"} /> */}
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
								onChange={(e) => setCoupon(e.target.value.toUpperCase())}
							/>

							<Button
								variant={'link'}
								onClick={handleCoupon}
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
					</>
				) : (
					<Text fontSize={'2xl'} fontWeight={'medium'} textAlign={'center'} py={'1rem'}>
						Checkout
					</Text>
				)}
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
							{transaction[TRANSACTION_DETAIL.GROSS_AMOUNT]}
						</Text>
					</Flex>
					<Flex width={'full'} justifyContent={'space-between'}>
						<Text className='text-black dark:text-white'>Tax</Text>
						<Text className='text-black dark:text-white'>
							{transaction[TRANSACTION_DETAIL.TAX]}
						</Text>
					</Flex>
					{COUPON_VALID || transaction[TRANSACTION_DETAIL.DISCOUNT] ? (
						<Flex width={'full'} justifyContent={'space-between'}>
							<Text className='text-black dark:text-white'>Discount</Text>
							<Text className='text-[#4CB072]'>-{transaction[TRANSACTION_DETAIL.DISCOUNT]}</Text>
						</Flex>
					) : null}
					<Divider orientation='horizontal' my={'0.5rem'} />
					<Flex width={'full'} justifyContent={'space-between'} fontWeight={'semibold'}>
						<Text className='text-black dark:text-white'>Total Amount</Text>
						<Text className='text-[#4CB072]'>
							{Number(transaction[TRANSACTION_DETAIL.TOTAL_AMOUNT]).toFixed(2)}
						</Text>
					</Flex>
				</Box>
			</Box>
		);
	}
);

export default Checkout;
