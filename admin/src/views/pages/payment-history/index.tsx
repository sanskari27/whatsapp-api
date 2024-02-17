import {
	Box,
	HStack,
	SkeletonText,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { MdPayment } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { StoreNames } from '../../../../../client/src/store';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar, setNavbarSearchText } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import { StoreState } from '../../../store';
import { NavbarSearchElement } from '../../components/navbar';
import PaymentDetails, { PaymentDetailsDrawerHandle } from './components/payment-details';

const PaymentHistory = () => {
	const theme = useTheme();
	const [searchParams] = useSearchParams();
	const PaymentDetailsRef = useRef<PaymentDetailsDrawerHandle>(null);

	const {
		list,
		uiDetails: { isFetching },
	} = useSelector((state: StoreState) => state[StoreNames.PAYMENTS]);

	const filtered = useFilteredList(list, { name: 1, phone_number: 1, whatsapp_numbers: 1 });

	useEffect(() => {
		pushToNavbar({
			title: 'Payment History',
			icon: MdPayment,
			actions: (
				<HStack>
					<NavbarSearchElement />
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, []);
	useEffect(() => {
		setNavbarSearchText(searchParams.get('phone') ?? '');
	}, [searchParams]);

	return (
		<>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>Sl no</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>Name</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>Phone No</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>WhatsApp Numbers</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>Status</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'}>Amount</Th>
						</Tr>
					</Thead>

					<Tbody>
						{isFetching && list.length === 0 ? (
							<Tr color={theme === 'dark' ? 'white' : 'black'}>
								<Td>
									<LineSkeleton />
								</Td>

								<Td>
									<LineSkeleton />
								</Td>

								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
							</Tr>
						) : (
							filtered.map((user, index) => (
								<Tr
									key={index}
									color={theme === 'dark' ? 'white' : 'black'}
									_hover={{
										backgroundColor: theme === 'dark' ? 'gray' : 'whiteSmoke',
										cursor: 'pointer',
									}}
									onClick={() => PaymentDetailsRef.current?.open(user)}
								>
									<Td>{index + 1}</Td>
									<Td>{user.name}</Td>
									<Td>{user.phone_number}</Td>
									<Td>
										{user.whatsapp_numbers.map((number, waIndex) => (
											<Box key={waIndex}>{number}</Box>
										))}
									</Td>
									<Td>{user.transaction_status?.toUpperCase()}</Td>
									<Td>{user.total_amount}</Td>
								</Tr>
							))
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<PaymentDetails ref={PaymentDetailsRef} />
		</>
	);
};

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

export default PaymentHistory;
