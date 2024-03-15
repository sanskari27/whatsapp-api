import { ChevronDownIcon } from '@chakra-ui/icons';
import {
	Avatar,
	Button,
	Flex,
	Icon,
	IconButton,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	Text,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { IoIosCloudDownload, IoMdCloseCircle } from 'react-icons/io';
import { LuBell } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { Colors, NAVIGATION } from '../../../config/const';
import useTask, { TASK_RESULT_TYPE, TASK_STATUS } from '../../../hooks/useTask';
import { StoreNames } from '../../../store/config';
import { setCurrentProfile } from '../../../store/reducers/UserDetailsReducers';
import { StoreState } from '../../../store/store';
import Each from '../../../utils/Each';
import './module.css';

function isActiveTab(tab: string): boolean {
	if (location.pathname.includes(tab)) return true;
	return false;
}

const object_none = {
	border: 'none',
	outline: 'none',
	bgColor: Colors.ACCENT_LIGHT,
};
const object_border = {
	border: `1px ${Colors.ACCENT_DARK} solid`,
	outline: 'none',
	bgColor: Colors.ACCENT_LIGHT,
};

export default function Navbar() {
	const dispatch = useDispatch();

	const { current_profile, profiles } = useSelector((state: StoreState) => state[StoreNames.USER]);

	return (
		<Flex
			justifyContent={'space-between'}
			alignItems={'center'}
			position={'fixed'}
			top={0}
			width={'full'}
			height={'65px'}
			borderBottomWidth={'thin'}
			borderBottomColor={'gray.300'}
			paddingX={'1rem'}
			zIndex={99}
			shadow={'md'}
			background={Colors.BACKGROUND_LIGHT}
		>
			<Flex gap='0.5rem' alignItems={'center'}>
				<Image src={LOGO} width={'36px'} />
				<Text fontWeight={'bold'} color={Colors.ACCENT_DARK}>
					wpautomation.tech
				</Text>
			</Flex>
			<Flex alignItems={'center'} gap={'1rem'}>
				<Flex gap={'1rem'}>
					<NavElement to={NAVIGATION.DASHBOARD} />
					<NavElement to={NAVIGATION.CAMPAIGNS} />
					<NavElement to={NAVIGATION.MEDIA} />
					<NavElement to={NAVIGATION.AUDIENCE} />
				</Flex>
				<Flex gap={'1rem'}>
					<NotificationButton />
				</Flex>
				<Flex>
					<Menu>
						<MenuButton
							as={Button}
							rightIcon={<ChevronDownIcon />}
							bg={Colors.ACCENT_LIGHT}
							width={'150px'}
							rounded={'lg'}
							_hover={object_none}
							_expanded={object_none}
							_focus={object_none}
							isDisabled={!profiles.find((p) => p.client_id === current_profile)}
						>
							Profile {profiles.findIndex((profile) => profile.client_id === current_profile) + 1}
						</MenuButton>
						<MenuList bg={Colors.ACCENT_LIGHT} rounded={'lg'}>
							{profiles.length > 0 ? (
								<Each
									items={profiles}
									render={(profile, index) => (
										<MenuItem
											bg={Colors.ACCENT_LIGHT}
											_hover={object_border}
											_active={object_border}
											_focus={object_border}
											width={'250px'}
											height={'40px'}
											onClick={() => dispatch(setCurrentProfile(profile.client_id))}
										>
											Profile {index + 1}
										</MenuItem>
									)}
								/>
							) : (
								<MenuItem
									bg={Colors.ACCENT_LIGHT}
									_hover={object_none}
									_active={object_none}
									_focus={object_none}
									width={'250px'}
									height={'40px'}
									onClick={() => dispatch(setCurrentProfile(''))}
								>
									No Profiles Found
								</MenuItem>
							)}
						</MenuList>
					</Menu>
				</Flex>
				<Flex gap={'1rem'} alignItems={'center'}>
					<Link to={NAVIGATION.SETTINGS + NAVIGATION.PROFILES}>
						<Avatar
							size='sm'
							bgColor={Colors.ACCENT_DARK}
							src='https://bit.ly/broken-link'
							cursor={'pointer'}
						/>
					</Link>
				</Flex>
			</Flex>
		</Flex>
	);
}

function NavElement({ to, title }: { to: string; title?: string }) {
	return (
		<Link
			to={to}
			className={`nav-menu ${isActiveTab(to) && 'nav-active !text-accent-dark'} capitalize`}
		>
			{title || to.split('/')[1]}
		</Link>
	);
}

function NotificationButton() {
	const { tasks, downloadTask, removeTask } = useTask();
	const ref = useRef(null);

	const removeAll = () => {
		tasks.forEach((task) => removeTask(task.id));
	};

	return (
		<Popover initialFocusRef={ref} isLazy placement='bottom-end' closeOnBlur={true}>
			<PopoverTrigger>
				<IconButton
					aria-label={'Notification'}
					icon={<Icon as={LuBell} width='20px' height='20px' />}
					bgColor={Colors.ACCENT_LIGHT}
					border={'none'}
					outline={'none'}
					_hover={object_none}
					_focus={object_none}
					_active={object_none}
					borderRadius={'12px'}
				/>
			</PopoverTrigger>
			<PopoverContent width={'700px'} bg={Colors.ACCENT_LIGHT} borderColor={Colors.ACCENT_DARK}>
				<PopoverHeader pt={4} border='0'>
					<Text
						ref={ref}
						textAlign={'right'}
						fontSize={'sm'}
						cursor={tasks.length > 0 ? 'pointer' : 'not-allowed'}
						textColor='black'
						textDecoration={'underline dashed'}
						textUnderlineOffset={'5px'}
						onClick={removeAll}
						opacity={tasks.length > 0 ? 1 : 0.6}
					>
						Clear All
					</Text>
				</PopoverHeader>
				<PopoverArrow bg='blue.800' />
				<PopoverBody maxHeight={'400px'} overflowY={'scroll'} pt={'0.5rem'} pb={'1.5rem'}>
					{tasks.length === 0 && (
						<Text fontWeight={'medium'} textAlign={'center'}>
							No new notifications
						</Text>
					)}
					<Each
						items={tasks}
						render={(task) => (
							<Flex
								justifyContent={'space-between'}
								alignItems={'center'}
								className='group border-b border-accent-dark/50'
								py={'0.5rem'}
							>
								<Icon
									as={IoMdCloseCircle}
									color={'red.200'}
									_hover={{
										color: 'red.600',
									}}
									mr={'0.25rem'}
									className={`!invisible group-hover:!visible transition-all ${
										task.status !== TASK_STATUS.COMPLETED && 'hidden'
									}`}
									cursor={'pointer'}
									onClick={() => task.status === TASK_STATUS.COMPLETED && removeTask(task.id)}
								/>
								<Text flexGrow={1} px={'1rem'}>
									{task.type.toLowerCase().split('_').join(' ')} {task.description}
								</Text>
								<IconButton
									hidden={task.data_result_type === TASK_RESULT_TYPE.NONE}
									isDisabled={task.status !== TASK_STATUS.COMPLETED}
									borderColor={Colors.ACCENT_DARK}
									color={Colors.ACCENT_DARK}
									aria-label='download file'
									icon={<Icon as={IoIosCloudDownload} height={5} width={5} />}
									onClick={() => downloadTask(task.id)}
									size={'sm'}
								/>
							</Flex>
						)}
					/>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
}
