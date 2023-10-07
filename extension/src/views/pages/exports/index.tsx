import { Box, Button, Checkbox, Flex, Image, Text } from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPORT_GREEN, EXPORT_WHITE } from '../../../assets/Images';
import { EXPORTS_TYPE, NAVIGATION } from '../../../config/const';
import { logout, startAuth, useAuth } from '../../../hooks/useAuth';
import ContactService from '../../../services/contact.service';
import ExportsService from '../../../services/exports.service';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import PaymentService from '../../../services/payment.service';
import CheckButton from '../../components/check-button';
import LoginModal, { LoginHandle } from '../../components/login';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const Exports = () => {
	const navigate = useNavigate();
	const loginModelRef = useRef<LoginHandle>(null);
	const [export_criteria, setExportCriteria] = useState({
		[EXPORTS_TYPE.ALL]: false,
		[EXPORTS_TYPE.SAVED]: false,
		[EXPORTS_TYPE.UNSAVED]: false,
		[EXPORTS_TYPE.GROUP]: false,
		[EXPORTS_TYPE.GROUP_ALL]: false,
		[EXPORTS_TYPE.LABEL]: false,
		[EXPORTS_TYPE.LABEL_ALL]: false,
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

	const [uiDetails, setUIDetails] = useState({
		exportClicked: false,
		paymentVerified: false,
		isBusiness: true,
	});

	const [Loading, setLoading] = useState({
		contactLoading: false,
		groupLoading: false,
		labelLoading: false,
	});

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

		const selectedGroups = export_criteria[EXPORTS_TYPE.GROUP]
			? export_criteria[EXPORTS_TYPE.GROUP_ALL] ?
				groups.map((item) => item.id)
				: selectedGroup
			: undefined;

		const selectedLabels = export_criteria[EXPORTS_TYPE.LABEL]
			? export_criteria[EXPORTS_TYPE.LABEL_ALL] ?
				labels.map((item) => item.id)
				: selectedLabel
			: undefined;

		ExportsService.exportContactsExcel({
			allContacts: ALL,
			savedContacts: SAVED,
			unsavedContacts: UNSAVED,
			groupIDs: selectedGroups,
			labelIDs: selectedLabels,
		}).finally(() => {
			setExporting((prevState) => ({
				...prevState,
				CSV: false,
			}));
			setUIDetails((prevState) => ({
				...prevState,
				exportClicked: false,
			}));
		});
	};

	const exportVCF = () => {
		setExporting((prevState) => ({
			...prevState,
			VCF: true,
		}));
		const selectedGroups = export_criteria[EXPORTS_TYPE.GROUP]
			? export_criteria[EXPORTS_TYPE.GROUP_ALL] ?
				groups.map((item) => item.id)
				: selectedGroup
			: undefined;

		const selectedLabels = export_criteria[EXPORTS_TYPE.LABEL]
			? export_criteria[EXPORTS_TYPE.LABEL_ALL] ?
				labels.map((item) => item.id)
				: selectedLabel
			: undefined;

		ExportsService.exportContactsVCF({
			allContacts: ALL,
			savedContacts: SAVED,
			unsavedContacts: UNSAVED,
			groupIDs: selectedGroups,
			labelIDs: selectedLabels,
		}).finally(() => {
			setExporting((prevState) => ({
				...prevState,
				VCF: false,
			}));
			setUIDetails((prevState) => ({
				...prevState,
				exportClicked: false,
			}));
		});
	};

	useEffect(() => {
		if (!isAuthenticated) return;

		setLoading({
			contactLoading: true,
			groupLoading: true,
			labelLoading: true,
		});
		ContactService.contactCount()
			.then((res) => {
				setContactsCount({
					[EXPORTS_TYPE.ALL]: res.total,
					[EXPORTS_TYPE.SAVED]: res.saved,
					[EXPORTS_TYPE.UNSAVED]: res.unsaved,
				});
			})
			.catch(logout)
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					contactLoading: false,
				}));
			});
		GroupService.listGroups()
			.then(setGroups)
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					groupLoading: false,
				}));
			});

		LabelService.listLabels()
			.then(setLabels)
			.catch((err) => {
				if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
					setUIDetails((prevState) => ({
						...prevState,
						isBusiness: false,
					}));
				}
			})
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					groupLoading: false,
				}));
			});
		PaymentService.isPaymentVerified().then((res) => {
			setUIDetails((prevState) => ({
				...prevState,
				paymentVerified: res,
			}));
		});
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
							{Loading.contactLoading
								? 'Loading...'
								: `${contactsCount[EXPORTS_TYPE.ALL]} Contacts`}
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
							{Loading.contactLoading
								? 'Loading...'
								: `${contactsCount[EXPORTS_TYPE.SAVED]} Contacts`}
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
							{Loading.contactLoading
								? 'Loading...'
								: `${contactsCount[EXPORTS_TYPE.UNSAVED]} Contacts`}
						</Text>
					</Flex>
					<Flex alignItems='flex-end' justifyContent={'space-between'}>
						<CheckButton
							name={'GROUP'}
							label='Group Contacts'
							value={GROUP}
							onChange={handleChange}
						/>
						<Text fontSize='xs' className='text-black dark:text-white' hidden={!isAuthenticated}>
							{Loading.groupLoading ? 'Loading...' : `${groups.length} Groups`}
						</Text>
					</Flex>
					<Flex alignItems='center' justifyContent='space-between'>
						<Multiselect
							disable={!GROUP || export_criteria[EXPORTS_TYPE.GROUP_ALL]}
							displayValue='name'
							placeholder='Select Group'
							onRemove={(selectedList) =>
								setSelectedGroup(selectedList.map((group: any) => group.id))
							}
							onSelect={(selectedList) => {
								setSelectedGroup(selectedList.map((group: any) => group.id));
							}}
							showCheckbox={true}
							hideSelectedList={true}
							options={groups}
							style={{
								searchBox: {
									border: 'none',
								},
							}}
							className='!w-[250px] !mr-2 !bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none '
						/>
						<Checkbox
							size='sm'
							colorScheme='green'
							className='!border-gray-300 text-black dark:text-white'
							isDisabled={!GROUP}
							onChange={(e) => handleChange({ name: 'GROUP_ALL', value: e.target.checked })}
							isChecked={export_criteria[EXPORTS_TYPE.GROUP_ALL]}
						>
							Select All
						</Checkbox>
					</Flex>
					<Flex alignItems='flex-end' justifyContent={'space-between'}>
						<CheckButton
							name={'LABEL'}
							label='Label Contacts'
							value={LABEL}
							isDisabled={!uiDetails.isBusiness}
							onChange={handleChange}
						/>
						<Text
							fontSize='xs'
							className='text-black dark:text-white '
							hidden={!isAuthenticated || !uiDetails.isBusiness}
						>
							{Loading.labelLoading ? 'Loading...' : `${labels.length} Labels`}
						</Text>
					</Flex>
					<Flex alignItems='center' justifyContent='space-between'>
						<Multiselect
							disable={!LABEL || export_criteria[EXPORTS_TYPE.LABEL_ALL]}
							displayValue='name'
							placeholder={uiDetails.isBusiness ? 'Select Label' : 'For Business Account Only'}
							onRemove={(selectedList) =>
								setSelectedLabel(selectedList.map((label: any) => label.id))
							}
							onSelect={(selectedList) =>
								setSelectedLabel(selectedList.map((label: any) => label.id))
							}
							showCheckbox={true}
							hideSelectedList={true}
							options={labels}
							style={{
								searchBox: {
									border: 'none',
								},
								inputField: {
									width: '100%',
								},
							}}
							className='!w-[250px] !mr-2 !bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none w-full '
						/>
						<Checkbox
							size='sm'
							colorScheme='green'
							className='!border-gray-300 text-black dark:text-white'
							isDisabled={!LABEL}
							onChange={(e) => handleChange({ name: 'LABEL_ALL', value: e.target.checked })}
							isChecked={export_criteria[EXPORTS_TYPE.LABEL_ALL]}
						>
							Select All
						</Checkbox>
					</Flex>
				</Flex>
			</Box>
			{!isAuthenticated ? (
				<Flex gap={'0.5rem'} direction={'column'}>
					<Text className="text-black text-center dark:text-white"><InfoOutlineIcon marginRight={'0.25rem'}/>Disclaimer: Please wait 5 minutes for contacts to sync after login.</Text>
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
				</Flex>
			) : !uiDetails.paymentVerified ? (
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
			) : !uiDetails.exportClicked ? (
				<Button
					bgColor={'green.300'}
					_hover={{
						bgColor: 'green.400',
					}}
					onClick={() =>
						setUIDetails((prevState) => ({
							...prevState,
							exportClicked: true,
						}))
					}
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
