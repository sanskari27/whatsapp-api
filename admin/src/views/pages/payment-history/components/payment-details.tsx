import {
	Box,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	HStack,
	Text,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTheme } from '../../../../hooks/useTheme';
import { PaymentRecord } from '../../../../store/types/PaymentState';

export type PaymentDetailsDrawerHandle = {
	open: (record: PaymentRecord) => void;
	close: () => void;
};

const PaymentDetails = forwardRef<PaymentDetailsDrawerHandle>((_, ref) => {
	const theme = useTheme();

	const [isOpen, setIsOpen] = useState(false);
	const [record, setRecord] = useState<PaymentRecord>();

	const onClose = () => setIsOpen(false);
	useImperativeHandle(ref, () => ({
		close: onClose,
		open: (record: PaymentRecord) => {
			setRecord({
				transaction_date: new Date(record.transaction_date).toDateString(),
				order_id: record.order_id,
				plan: record.plan,
				whatsapp_numbers: record.whatsapp_numbers,
				name: record.name,
				phone_number: record.phone_number,
				email: record.email,
				admin_number: record.admin_number,
				billing_address: {
					street: record.billing_address.street,
					city: record.billing_address.city,
					district: record.billing_address.district,
					state: record.billing_address.state,
					country: record.billing_address.country,
					pincode: record.billing_address.pincode,
					gstin: record.billing_address.gstin,
				},
				gross_amount: record.gross_amount,
				discount: record.discount,
				tax: record.tax,
				transaction_status: record.transaction_status,
				invoice_id: record.invoice_id,
				coupon: record.coupon,
				total_amount: record.gross_amount + record.tax - record.discount,
			});
			setIsOpen(true);
		},
	}));

	return (
		<Drawer size={'xl'} isOpen={isOpen} placement='right' onClose={onClose}>
			<DrawerOverlay />
			<DrawerContent>
				<DrawerCloseButton />
				<DrawerHeader
					bgColor={theme === 'dark' ? '#252525' : 'white'}
					textColor={theme === 'dark' ? 'whitesmoke' : 'black'}
				>
					Payment Record
				</DrawerHeader>
				<DrawerBody bgColor={theme === 'dark' ? '#252525' : 'white'}>
					<Box>
						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							color={theme === 'dark' ? 'whitesmoke' : 'black'}
						>
							Personal Details
						</Text>
						<Divider my={'0.5rem'} />
						<Box>
							<Flex gap={'0.5rem'}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Name:
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.name}
								</Text>
							</Flex>
							<Flex gap={'0.5rem'}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Email:
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.email}
								</Text>
							</Flex>
						</Box>

						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							color={theme === 'dark' ? 'whitesmoke' : 'black'}
							mt={'2rem'}
						>
							Billing Details
						</Text>
						<Divider py={'0.5rem'} />
						<Box>
							<HStack pt={'1rem'}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Admin number :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.phone_number}
								</Text>
							</HStack>
							<HStack pt={'1rem'}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Whatsapp numbers :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.whatsapp_numbers.join(', ')}
								</Text>
							</HStack>
							<HStack pt={'1rem'}>
								<HStack flex={1}>
									<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
										Plan :
									</Text>
									<Text
										fontWeight={'medium'}
										fontSize={'lg'}
										color={theme === 'dark' ? 'whitesmoke' : 'black'}
									>
										{record?.plan}
									</Text>
								</HStack>
								<HStack flex={2}>
									<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
										Discount applied :
									</Text>
									<Text
										fontWeight={'medium'}
										fontSize={'lg'}
										color={theme === 'dark' ? 'whitesmoke' : 'black'}
									>
										{record?.coupon ?? 'No coupon applied'}
									</Text>
								</HStack>
							</HStack>
						</Box>
						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							color={theme === 'dark' ? 'whitesmoke' : 'black'}
							mt={'2rem'}
						>
							Payment Details
						</Text>
						<Divider py={'0.5rem'} />
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Gross amount :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.gross_amount}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Tax :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.tax}
								</Text>
							</HStack>
						</HStack>
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Discount :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.discount}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Total amount :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.total_amount}
								</Text>
							</HStack>
						</HStack>
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Order ID :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.order_id ?? ''}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Invoice ID :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.invoice_id ?? 'Payment not completed yet'}
								</Text>
							</HStack>
						</HStack>
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Transaction Date :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.transaction_date ?? 'Payment not completed yet'}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Payment Status :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.transaction_status ?? 'Payment not completed yet'}
								</Text>
							</HStack>
						</HStack>
						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							color={theme === 'dark' ? 'whitesmoke' : 'black'}
							mt={'2rem'}
						>
							Billing Address
						</Text>
						<Divider py={'0.5rem'} />
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									Street :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.street ?? ''}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									City :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.city ?? ''}
								</Text>
							</HStack>
						</HStack>
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									District :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.district ?? ''}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									State :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.state ?? ''}
								</Text>
							</HStack>
						</HStack>
						<HStack pt={'1rem'}>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									District :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.country ?? ''}
								</Text>
							</HStack>
							<HStack flex={1}>
								<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
									State :
								</Text>
								<Text
									fontWeight={'medium'}
									fontSize={'lg'}
									color={theme === 'dark' ? 'whitesmoke' : 'black'}
								>
									{record?.billing_address.pincode ?? ''}
								</Text>
							</HStack>
						</HStack>
						<HStack>
							<Text fontSize={'lg'} color={theme === 'dark' ? 'whitesmoke' : 'black'}>
								GSTIN :
							</Text>
							<Text
								fontWeight={'medium'}
								fontSize={'lg'}
								color={theme === 'dark' ? 'whitesmoke' : 'black'}
							>
								{record?.billing_address.gstin ?? 'No GSTIN provided'}
							</Text>
						</HStack>
					</Box>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
});

export default PaymentDetails;
