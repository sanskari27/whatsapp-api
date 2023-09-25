import { Box, Button, Flex, Image, Select, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { logout, startAuth, useAuth } from '../../../hooks/useAuth';
import { EXPORT_GREEN, EXPORT_WHITE } from '../../../assets/Images';
import CheckButton from '../../components/check-button';
import { EXPORTS_TYPE, NAVIGATION } from '../../../config/const';
import LoginModal, { LoginHandle } from '../../components/login';
import ContactService from '../../../services/contact.service';
import GroupService from '../../../services/group.service';
import PaymentService from '../../../services/payment.service';
import { useNavigate } from 'react-router-dom';
import ExportsService from '../../../services/exports.service';
import LabelService from '../../../services/label.service';
import Multiselect from 'multiselect-react-dropdown';

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

	const [exporting, setExporting] = useState({
		CSV: false,
		VCF: false,
	});

	const [contactsCount, setContactsCount] = useState({
		[EXPORTS_TYPE.ALL]: 0,
		[EXPORTS_TYPE.SAVED]: 0,
		[EXPORTS_TYPE.UNSAVED]: 0,
	});

	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } = useAuth();

	const [selectedGroup, setSelectedGroup] = useState([]);
	const [selectedLabel, setSelectedLabel] = useState([]);
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
			id: '',
			name: 'No Group Selected!',
		},
	]);
	const [labels, setLabels] = useState([
		{
			id: '',
			name: 'No Label Selected!',
		},
	]);

	const exportExcel = () => {
		setExporting((prevState) => ({
			...prevState,
			CSV: true,
		}));
		ExportsService.exportContactsExcel({
			allContacts: ALL,
			savedContacts: SAVED,
			unsavedContacts: UNSAVED,
			groupIDs: selectedGroup.length > 0 ? selectedGroup : undefined,
			labelIDs: selectedLabel.length > 0 ? selectedLabel : undefined,
		}).finally(() => {
			setExporting((prevState) => ({
				...prevState,
				CSV: false,
			}));
			setExportClicked(false);
		});
	};

	const exportVCF = () => {
		setExporting((prevState) => ({
			...prevState,
			VCF: true,
		}));
		ExportsService.exportContactsVCF({
			allContacts: ALL,
			savedContacts: SAVED,
			unsavedContacts: UNSAVED,
			groupIDs: selectedGroup.length > 0 ? selectedGroup : undefined,
			labelIDs: selectedLabel.length > 0 ? selectedLabel : undefined,
		}).finally(() => {
			setExporting((prevState) => ({
				...prevState,
				VCF: false,
			}));
			setExportClicked(false);
		});
	};

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
			.catch(logout);
		GroupService.listGroups().then(setGroups);
		LabelService.listLabels().then(setLabels);
		PaymentService.isPaymentVerified().then(setPaymentVerified);
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

					<Multiselect
						disable={!GROUP}
						displayValue='name'
						placeholder='Select Group'
						onRemove={(selectedList) =>
							setSelectedGroup(selectedList.map((group: any) => group.id))
						}
						onSelect={(selectedList) =>
							setSelectedGroup(selectedList.map((group: any) => group.id))
						}
						options={groups}
						style={{
							searchBox: {
								border: 'none',
							},
						}}
						className='!bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none w-full '
					/>

					<CheckButton
						name={'LABEL'}
						label='Label Contacts'
						value={LABEL}
						onChange={handleChange}
					/>
					<Multiselect
						disable={!LABEL}
						displayValue='name'
						placeholder='Select Label'
						onRemove={(selectedList) =>
							setSelectedLabel(selectedList.map((label: any) => label.id))
						}
						onSelect={(selectedList) =>
							setSelectedLabel(selectedList.map((label: any) => label.id))
						}
						options={labels}
						style={{
							searchBox: {
								border: 'none',
							},
						}}
						className='!bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none w-full '
					/>
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
					onClick={() => navigate(NAVIGATION.FEATURES)}
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
						width={'48%'}
						onClick={exportExcel}
						isLoading={exporting.CSV}
					>
						<Text color={'white'}>CSV</Text>
					</Button>
					<Button
						bgColor={'yellow.400'}
						_hover={{
							bgColor: 'yellow.500',
						}}
						width={'48%'}
						isLoading={exporting.VCF}
						onClick={exportVCF}
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
