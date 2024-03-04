import {
	Box,
	Button,
	Flex,
	Heading,
	Tab,
	TabIndicator,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useDisclosure,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { BiSolidLabel } from 'react-icons/bi';
import { FaLayerGroup } from 'react-icons/fa';
import { ImWhatsapp } from 'react-icons/im';
import { useSelector } from 'react-redux';
import { useOutlet } from 'react-router-dom';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';
import AssignLabelDialog, { AssignLabelDialogHandler } from './components/assign-label-dialog';
import CreateGroupDialog, { CreateGroupDialogHandler } from './components/create-group-dialog';
import GroupMerge from './components/group-merge-dialog';
import MergedGroups from './tabs/merged-group';
import WhatsappGroups from './tabs/whatsapp-groups';

const Groups = () => {
	const outlet = useOutlet();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const createGroupDialogRef = useRef<CreateGroupDialogHandler>(null);
	const assignLabelDialogRef = useRef<AssignLabelDialogHandler>(null);

	const { userType } = useSelector((state: StoreState) => state[StoreNames.USER]);

	return (
		<>
			<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
				<Heading color={Colors.PRIMARY_DARK}>
					<Flex width={'97%'} justifyContent={'space-between'} alignItems={'flex-end'}>
						Groups
						<Flex gap={'0.5rem'}>
							<Button
								variant='outline'
								size={'sm'}
								colorScheme='green'
								onClick={() => assignLabelDialogRef.current?.open()}
								leftIcon={<BiSolidLabel />}
							>
								Assign Labels
							</Button>
							<Button
								variant='outline'
								size={'sm'}
								colorScheme='green'
								onClick={() => createGroupDialogRef.current?.open()}
								leftIcon={<ImWhatsapp />}
							>
								Create Group
							</Button>
							<Button
								variant='outline'
								size={'sm'}
								colorScheme='green'
								onClick={onOpen}
								leftIcon={<FaLayerGroup />}
							>
								Merge Groups
							</Button>
						</Flex>
					</Flex>
				</Heading>

				<Box marginTop={'1rem'} width={'98%'} pb={'5rem'}>
					<Tabs position='relative' variant={'unstyled'} mb={'1rem'}>
						<TabList>
							<Tab color={Colors.PRIMARY_DARK}>Merged Groups</Tab>
							<Tab color={Colors.PRIMARY_DARK}>Whatsapp Groups</Tab>
						</TabList>
						<TabIndicator mt='-1.5px' height='2px' bg={Colors.ACCENT_DARK} borderRadius='1px' />
						<Box marginTop={'1rem'}></Box>
						<TabPanels>
							<TabPanel>
								<MergedGroups />
							</TabPanel>
							<TabPanel>
								<WhatsappGroups />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			</Flex>
			<CreateGroupDialog ref={createGroupDialogRef} />
			<GroupMerge isOpen={isOpen} onClose={onClose} />
			{userType === 'BUSINESS' && <AssignLabelDialog ref={assignLabelDialogRef} />}
			{outlet}
		</>
	);
};

export default Groups;
