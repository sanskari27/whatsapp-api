import { CheckIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, IconButton, Image, Select, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import { EXPORT_GREEN, EXPORT_WHITE } from '../../../assets/Images';
import CheckButton from '../../components/check-button';
import { EXPORTS_TYPE, NAVIGATION } from '../../../config/const';
import LoginModal, { LoginHandle } from '../../components/login';
import ContactService from '../../../services/contact.service';
import GroupService from '../../../services/group.service';
import PaymentService from '../../../services/payment.service';
import { useNavigate } from 'react-router-dom';

const Exports = () => {
	const navigate = useNavigate();
	const loginModelRef = useRef<LoginHandle>(null);
	const [export_criteria, setExportCriteria] = useState({
		[EXPORTS_TYPE.ALL]: false,
		[EXPORTS_TYPE.SAVED]: false,
		[EXPORTS_TYPE.UNSAVED]: false,
		[EXPORTS_TYPE.GROUP]: false,
		[EXPORTS_TYPE.LABEL]: false,
	});

	const [contactsCount, setContactsCount] = useState({
		[EXPORTS_TYPE.ALL]: 0,
		[EXPORTS_TYPE.SAVED]: 0,
		[EXPORTS_TYPE.UNSAVED]: 0,
	});

	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } = useAuth();

	const [selectedGroup, setSelectedGroup] = useState('');
	const [selectedLabel, setSelectedLabel] = useState('');
	const [exportClicked, setExportClicked] = useState(false);
	const [paymentVerified, setPaymentVerified] = useState(false);

	const { ALL, SAVED, UNSAVED, GROUP, LABEL } = export_criteria;

	const handleChange = async ({ name, value }: { name: string; value: boolean }) => {
		setExportCriteria((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const [groups, setGroups] = useState([
		{
			id: 'INVALID',
			name: 'No Group Selected!',
		},
	]);
	const [labels, setLabels] = useState([
		{
			id: 'INVALID',
			name: 'No Label Selected!',
		},
	]);

	useEffect(() => {
		if (!isAuthenticated) return;
		ContactService.contactCount()
			.then((res) => {
				setContactsCount({
					[EXPORTS_TYPE.ALL]: res.total,
					[EXPORTS_TYPE.SAVED]: res.saved,
					[EXPORTS_TYPE.UNSAVED]: res.unsaved,
				});
			})
			.catch(() => {});
		GroupService.listGroups()
			.then((res) => setGroups(res))
			.catch(() => {});
		PaymentService.isPaymentVerified()
			.then((res) => setPaymentVerified(res))
			.catch(() => {});
	}, [isAuthenticated]);

	useEffect(() => {
		if (!!qrGenerated) {
			loginModelRef.current?.open();
		} else {
			loginModelRef.current?.close();
		}
	}, [qrGenerated]);

	return (
		<Flex direction={'column'} gap={'0.5rem'}>
			<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
				<Image src={EXPORT_GREEN} width={4} alt='' />
				<Text className='text-black dark:text-white' fontSize='md'>
					Exports
				</Text>
			</Flex>
			<Box
				className='bg-[#ECECEC] dark:bg-[#535353]'
				p={'0.5rem'}
				borderRadius={'20px'}
				mb={'1.5rem'}
			>
				<Flex flexDirection={'column'} gap={'0.5rem'} width={'full'}>
					<Flex alignItems='flex-end' justifyContent={'space-between'}>
						<CheckButton
							name={'ALL'}
							label='All Chat Contacts'
							value={ALL}
							onChange={handleChange}
						/>
						<Text fontSize='xs' className='text-black dark:text-white'>
							{contactsCount[EXPORTS_TYPE.ALL]} Contacts
						</Text>
					</Flex>
					<Flex alignItems='flex-end' justifyContent={'space-between'}>
						<CheckButton
							name={'SAVED'}
							label='All Saved Contacts'
							value={SAVED}
							onChange={handleChange}
						/>
						<Text fontSize='xs' className='text-black dark:text-white'>
							{contactsCount[EXPORTS_TYPE.SAVED]} Contacts
						</Text>
					</Flex>
					<Flex alignItems='flex-end' justifyContent={'space-between'}>
						<CheckButton
							name={'UNSAVED'}
							label='All Unsaved Contacts'
							value={UNSAVED}
							onChange={handleChange}
						/>
						<Text fontSize='xs' className='text-black dark:text-white'>
							{contactsCount[EXPORTS_TYPE.UNSAVED]} Contacts
						</Text>
					</Flex>

					<CheckButton
						name={'GROUP'}
						label='Group Contacts'
						value={GROUP}
						onChange={handleChange}
					/>
					<Select
						size='sm'
						width={'full'}
						color={'white'}
						border={'none'}
						className='!bg-[#A6A6A6] dark:!bg-[#252525]'
						borderRadius={'10px'}
						isDisabled={!GROUP}
						onChange={(e) => setSelectedGroup(e.target.value)}
					>
						{groups.map((group, index) => (
							<option key={index} value={group.id}>
								{group.name}
							</option>
						))}
					</Select>

					<CheckButton
						name={'LABEL'}
						label='Label Contacts'
						value={LABEL}
						onChange={handleChange}
					/>

					<Select
						size='sm'
						width={'full'}
						className='!bg-[#A6A6A6] dark:!bg-[#252525]'
						color={'white'}
						border={'none'}
						borderRadius={'10px'}
						isDisabled={!LABEL}
						onChange={(e) => setSelectedLabel(e.target.value)}
					>
						{labels.map((label, index) => (
							<option key={index} value={label.id}>
								{label.name}
							</option>
						))}
					</Select>
				</Flex>
			</Box>
			{!isAuthenticated ? (
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
			) : !paymentVerified ? (
				<Button
					bgColor={'yellow.400'}
					_hover={{
						bgColor: 'yellow.500',
					}}
					onClick={() => navigate(NAVIGATION.CHECKOUT)}
				>
					<Flex gap={'0.5rem'}>
						<Text color={'white'}>Subscribe</Text>
					</Flex>
				</Button>
			) : !exportClicked ? (
				<Button
					bgColor={'green.300'}
					_hover={{
						bgColor: 'green.400',
					}}
					onClick={() => setExportClicked(true)}
				>
					<Flex gap={'0.5rem'}>
						<Image src={EXPORT_WHITE} width={4} alt='' />
						<Text color={'white'}>Export</Text>
					</Flex>
				</Button>
			) : (
				<Flex justifyContent={'space-between'} alignItems={'center'}>
					<Button
						bgColor={'green.300'}
						_hover={{
							bgColor: 'green.400',
						}}
						width={'45%'}
					>
						<Text color={'white'}>CSV</Text>
					</Button>
					<Button
						bgColor={'green.300'}
						_hover={{
							bgColor: 'green.400',
						}}
						width={'45%'}
					>
						<Text color={'white'}>VCF</Text>
					</Button>
				</Flex>
			)}

			<LoginModal ref={loginModelRef} qr={qrCode} />
		</Flex>
	);
};

export default Exports;
