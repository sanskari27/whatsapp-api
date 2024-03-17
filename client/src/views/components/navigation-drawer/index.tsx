import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { AiFillMessage, AiOutlineMessage } from 'react-icons/ai';
import { FaFileImage, FaLink, FaRegFileImage } from 'react-icons/fa';
import { IoTimer, IoTimerOutline } from 'react-icons/io5';
import {
	MdCampaign,
	MdGroups,
	MdOutlineCampaign,
	MdOutlineGroups,
	MdOutlinePoll,
	MdPoll,
} from 'react-icons/md';
import {
	RiContactsFill,
	RiContactsLine,
	RiFileExcel2Fill,
	RiFileExcel2Line,
	RiRobot2Fill,
	RiRobot2Line,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../config/const';
import Each from '../../../utils/Each';

function isActiveTab(tab: string): boolean {
	if (location.pathname.includes(tab)) return true;
	return false;
}

const OPTIONS = {
	[NAVIGATION.DASHBOARD]: [
		{
			title: 'Campaign Report',
			icon: MdOutlineCampaign,
			active_icon: MdCampaign,
			parent: NAVIGATION.DASHBOARD,
			route: NAVIGATION.CAMPAIGN_REPORTS,
		},
		{
			title: 'Daily Messenger Report',
			icon: IoTimerOutline,
			active_icon: IoTimer,
			parent: NAVIGATION.DASHBOARD,
			route: NAVIGATION.DAILY_MESSENGER,
		},
		{
			title: 'Auto Responder Report',
			icon: RiRobot2Line,
			active_icon: RiRobot2Fill,
			parent: NAVIGATION.DASHBOARD,
			route: NAVIGATION.AUTO_RESPONDER,
		},
		{
			title: 'Poll Responses',
			icon: MdOutlinePoll,
			active_icon: MdPoll,
			parent: NAVIGATION.DASHBOARD,
			route: NAVIGATION.POLL_RESPONSES,
		},
	],
	[NAVIGATION.CAMPAIGNS]: [
		{
			title: 'Bulk Messaging',
			icon: AiOutlineMessage,
			active_icon: AiFillMessage,
			parent: NAVIGATION.CAMPAIGNS,
			route: NAVIGATION.BULK_MESSAGING,
		},
		{
			title: 'Auto Responder',
			icon: RiRobot2Line,
			active_icon: RiRobot2Fill,
			parent: NAVIGATION.CAMPAIGNS,
			route: NAVIGATION.AUTO_RESPONDER,
		},
		{
			title: 'Daily Messenger',
			icon: IoTimerOutline,
			active_icon: IoTimer,
			parent: NAVIGATION.CAMPAIGNS,
			route: NAVIGATION.DAILY_MESSENGER,
		},
	],
	[NAVIGATION.MEDIA]: [
		{
			title: 'Contacts',
			icon: RiContactsLine,
			active_icon: RiContactsFill,
			parent: NAVIGATION.MEDIA,
			route: NAVIGATION.CONTACT,
		},
		{
			title: 'Short Links',
			icon: FaLink,
			active_icon: FaLink,
			parent: NAVIGATION.MEDIA,
			route: NAVIGATION.SHORT_LINKS,
		},
		{
			title: 'Attachments',
			icon: FaRegFileImage,
			active_icon: FaFileImage,
			parent: NAVIGATION.MEDIA,
			route: NAVIGATION.ATTACHMENTS,
		},
	],
	[NAVIGATION.AUDIENCE]: [
		{
			title: 'CSV',
			icon: RiFileExcel2Line,
			active_icon: RiFileExcel2Fill,
			parent: NAVIGATION.AUDIENCE,
			route: NAVIGATION.CSV,
		},
		{
			title: 'Groups',
			icon: MdOutlineGroups,
			active_icon: MdGroups,
			parent: NAVIGATION.AUDIENCE,
			route: NAVIGATION.GROUP,
		},
	],
	// [NAVIGATION.SETTINGS]: [
	// 	{
	// 		title: 'User Details',
	// 		icon: IoSettingsOutline,
	// 		active_icon: IoSettings,
	// 		parent: NAVIGATION.SETTINGS,
	// 		route: NAVIGATION.USER_SETTINGS,
	// 	},
	// 	{
	// 		title: 'Profiles',
	// 		icon: HiOutlineDeviceMobile,
	// 		active_icon: HiDeviceMobile,
	// 		parent: NAVIGATION.SETTINGS,
	// 		route: NAVIGATION.PROFILES,
	// 	},
	// ],
};

const SHORTCUTS = {
	[NAVIGATION.DASHBOARD]: [
		{
			title: 'Create New Campaign',
			route: NAVIGATION.CAMPAIGNS,
		},
	],
	[NAVIGATION.CAMPAIGNS]: [
		{
			title: 'Manage Media',
			route: NAVIGATION.MEDIA + NAVIGATION.ATTACHMENTS,
		},
		{
			title: 'Reports',
			route: NAVIGATION.DASHBOARD,
		},
	],
	[NAVIGATION.MEDIA]: [
		{
			title: 'Create New Campaign',
			route: NAVIGATION.CAMPAIGNS,
		},
		{
			title: 'Reports',
			route: NAVIGATION.DASHBOARD,
		},
	],
	[NAVIGATION.AUDIENCE]: [
		{
			title: 'Export Contacts',
			route: NAVIGATION.AUDIENCE + NAVIGATION.GROUP + NAVIGATION.EXPORT_CONTACTS,
		},
	],
};

export default function NavigationDrawer({ extraPadding = 0 }: { extraPadding?: number }) {
	const options = OPTIONS['/' + location.pathname?.split('/')?.[1]] ?? [];
	const shortcuts = SHORTCUTS['/' + location.pathname?.split('/')?.[1]] ?? [];

	const h = 65 + extraPadding + 'px';
	return (
		<Box>
			<Flex
				direction={'column'}
				width={'300px'}
				userSelect={'none'}
				position={'fixed'}
				minHeight={`calc(95% - ${h})`}
				top={h}
				paddingLeft={'1.5rem'}
				zIndex={99}
				paddingTop={'1rem'}
				background={Colors.BACKGROUND_LIGHT}
			>
				<Flex direction={'column'} flexGrow={1} overflowY={'auto'} paddingBottom={'1rem'}>
					<Flex direction={'column'} flexGrow={1} gap={'0.5rem'}>
						<Each
							items={options}
							render={(item) => {
								const isActive = isActiveTab(item.parent + item.route);
								return (
									<Link to={item.parent + item.route}>
										<Flex
											className={
												isActive
													? ' bg-[#E8F2ED]   font-medium'
													: 'hover:!font-medium   hover:!bg-accent-light hover:shadow-sm '
											}
											paddingY={'0.75rem'}
											paddingX={'1rem'}
											rounded={'lg'}
											gap={'1rem'}
											cursor={'pointer'}
											textColor={'black'}
											alignItems={'center'}
										>
											<Icon
												as={isActive ? item.active_icon : item.icon}
												color={'black'}
												width={'18px'}
												height={'18px'}
											/>
											<Text
												transition={'none'}
												className={isActive ? 'text-primary-dark' : 'text-gray-800'}
											>
												{item.title}
											</Text>
										</Flex>
									</Link>
								);
							}}
						/>
					</Flex>
					<Flex width={'full'} direction={'column'} gap={'0.5rem'}>
						<Each
							items={shortcuts}
							render={(el, index) => (
								<Link to={el.route}>
									<Button
										width={'full'}
										colorScheme='green'
										variant={index % 2 === 0 ? 'outline' : 'solid'}
										paddingY={'0.5rem'}
										paddingX={'1rem'}
										rounded={'lg'}
									>
										{el.title}
									</Button>
								</Link>
							)}
						/>
					</Flex>
				</Flex>
			</Flex>
		</Box>
	);
}
