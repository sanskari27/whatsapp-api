import {
	Box,
	HStack,
	Select,
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
import { MdGroups3 } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar, setNavbarSearchText } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import UsersService from '../../../services/users.service';
import { StoreNames, StoreState } from '../../../store';
import { setUsersList } from '../../../store/reducers/UsersReducer';
import { User } from '../../../store/types/UsersState';
import { NavbarSearchElement } from '../../components/navbar';
import ExtendSubscriptionDialog, { ExtendSubscriptionDialogHandle } from './components';

const UsersPage = () => {
	const theme = useTheme();
	const navigate = useNavigate();

	const dispatch = useDispatch();
	const {
		list,
		uiDetails: { isFetching },
	} = useSelector((state: StoreState) => state[StoreNames.USERS]);
	const extendSubscriptionDialogRef = useRef<ExtendSubscriptionDialogHandle>(null);

	useEffect(() => {
		pushToNavbar({
			title: 'Users',
			icon: MdGroups3,
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

	const filtered = useFilteredList(list, { name: 1, phone: 1 });

	const handleAction = ({ id, phone, subscription_expiry }: User, action: string) => {
		if (action === 'extend_expiry') {
			return extendSubscriptionDialogRef.current?.open(id, subscription_expiry);
		}
		if (action === 'payment_history') {
			setNavbarSearchText(phone);
			return navigate({
				pathname: NAVIGATION.PAYMENT_HISTORY,
				search: createSearchParams({ phone }).toString(),
			});
		}
	};
	const extendSubscription = (user_id: string, months: string) => {
		UsersService.extendExpiry(user_id, months ?? 0).then(async () => {
			const users = await UsersService.getUsers();
			dispatch(setUsersList(users));
		});
	};

	return (
		<Box>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								sl no
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'45%'}>
								Name
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'15%'} isNumeric>
								Phone
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'10%'}>
								Type
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'10%'}>
								Expiry
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'20%'}>
								Actions
							</Th>
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
							</Tr>
						) : (
							filtered.map((user, index) => {
								return (
									<Tr key={index} color={theme === 'dark' ? 'white' : 'black'}>
										<Td>{index + 1}.</Td>
										<Td>{user.name}</Td>
										<Td isNumeric>{user.phone}</Td>
										<Td>{user.type}</Td>
										<Td>{user.subscription_expiry}</Td>
										<Td>
											<Select value={''} onChange={(e) => handleAction(user, e.target.value)}>
												<option
													className='bg-white text-black dark:bg-gray-700 dark:text-white'
													value='select'
												>
													Select Action
												</option>
												<option
													className='bg-white text-black dark:bg-gray-700 dark:text-white'
													value='extend_expiry'
												>
													Extend Subscription
												</option>
												<option
													className='bg-white text-black dark:bg-gray-700 dark:text-white'
													value='payment_history'
												>
													Payment History
												</option>
												<option
													className='bg-white text-black dark:bg-gray-700 dark:text-white'
													value='logout'
												>
													Logout User
												</option>
											</Select>
										</Td>
									</Tr>
								);
							})
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<ExtendSubscriptionDialog ref={extendSubscriptionDialogRef} onConfirm={extendSubscription} />
		</Box>
	);
};

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

export default UsersPage;
