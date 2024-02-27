import {
	Box,
	Button,
	FormControl,
	FormLabel,
	HStack,
	Switch,
	TabPanel,
	TabPanels,
	Tabs,
	useDisclosure,
} from '@chakra-ui/react';

import { useEffect, useRef, useState } from 'react';
import { MdAdminPanelSettings, MdGroupAdd, MdGroups3 } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import GroupService from '../../../services/group.service';
import { StoreNames, StoreState } from '../../../store';
import {
	clearEditMergeGroup,
	clearSelectedGroup,
	deleteMergedGroup,
	setIsDeleting,
} from '../../../store/reducers/MergeGroupReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarDeleteElement, NavbarSearchElement } from '../../components/navbar';
import {
	GroupMergeDialog,
	GroupSettingDialog,
	MergedGroupTab,
	WhatsappGroupTab,
} from './components';

const GroupMergePage = () => {
	const {
		isOpen: isMergeDialogOpen,
		onOpen: openMergeDialog,
		onClose: closeMergeDialog,
	} = useDisclosure();
	const {
		isOpen: isSettingDialogOpen,
		onOpen: openSettingDialog,
		onClose: closeSettingDialog,
	} = useDisclosure();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const [tabIndex, setTabIndex] = useState(0);

	const dispatch = useDispatch();
	const {
		selectedGroups,
		uiDetails: { isDeleting },
	} = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const deleteGroup = () => {
		dispatch(setIsDeleting(true));
		selectedGroups.forEach(async (id) => {
			GroupService.deleteMerged(id).then((res) => {
				if (!res) {
					return;
				}
				dispatch(deleteMergedGroup(id));
			});
		});
	};

	useEffect(() => {
		function handleSwitchChange(isWhatsappGroups: boolean) {
			setTabIndex(isWhatsappGroups ? 1 : 0);
			dispatch(clearSelectedGroup());
		}
		pushToNavbar({
			title: 'Groups',
			icon: MdGroups3,
			actions: (
				<HStack>
					<FormControl width={'fit-content'} display='flex' alignItems='center' gap='0.5rem'>
						<FormLabel mb='0'>Merged Groups</FormLabel>
						<Switch id='merged-groups' onChange={(e) => handleSwitchChange(e.target.checked)} />
						<FormLabel mb='0'>Whatsapp Groups</FormLabel>
					</FormControl>
					<NavbarSearchElement />
					<NavbarDeleteElement
						isDisabled={selectedGroups.length === 0 || tabIndex !== 0}
						onClick={() => confirmationDialogRef.current?.open('')}
					/>
					{tabIndex === 0 ? (
						<Button
							leftIcon={<MdGroupAdd />}
							size={'sm'}
							colorScheme='blue'
							onClick={() => {
								dispatch(clearEditMergeGroup());
								openMergeDialog();
							}}
						>
							MERGE
						</Button>
					) : (
						<Button
							leftIcon={<MdAdminPanelSettings />}
							size={'sm'}
							colorScheme='blue'
							isDisabled={selectedGroups.length === 0}
							onClick={openSettingDialog}
						>
							GROUP SETTINGS
						</Button>
					)}
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [openMergeDialog, selectedGroups.length, isDeleting, dispatch, tabIndex, openSettingDialog]);

	return (
		<Box>
			<Tabs index={tabIndex}>
				{/* <TabList>
					<Tab>One</Tab>
					<Tab>Two</Tab>
					<Tab>Three</Tab>
				</TabList> */}
				<TabPanels>
					<TabPanel>
						<MergedGroupTab />
					</TabPanel>
					<TabPanel>
						<WhatsappGroupTab />
					</TabPanel>
				</TabPanels>
			</Tabs>
			<ConfirmationDialog
				ref={confirmationDialogRef}
				onConfirm={deleteGroup}
				type={'Merged Groups'}
			/>
			<GroupMergeDialog isOpen={isMergeDialogOpen} onClose={closeMergeDialog} />
			<GroupSettingDialog isOpen={isSettingDialogOpen} onClose={closeSettingDialog} />
		</Box>
	);
};

export default GroupMergePage;
