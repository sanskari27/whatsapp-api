import {
	Box,
	Button,
	Card,
	CardBody,
	CardFooter,
	Divider,
	Flex,
	FormControl,
	FormLabel,
	HStack,
	Heading,
	Image,
	Stack,
	Switch,
	Text,
	VStack,
	Wrap,
	WrapItem,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { IoLogOut } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { WA_AUTH, WA_DEVICE } from '../../../../assets/Images';
import { Colors, NAVIGATION } from '../../../../config/const';
import useProfile from '../../../../hooks/useProfile';
import AuthService from '../../../../services/auth.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	removeProfile,
	setUserConfig,
	setUserDetails,
} from '../../../../store/reducers/UserDetailsReducers';
import Each from '../../../../utils/Each';
import AddDeviceDialog, { AddDeviceDialogHandle } from './components/AddDeviceDialog';

export default function Profiles() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const addProfileRef = useRef<AddDeviceDialogHandle | null>(null);
	const { addDevice, isAuthenticating, qrCode, status } = useProfile();
	const {
		max_profiles,
		profiles,
		ui_config: { load_preview, confirmation_required },
	} = useSelector((state: StoreState) => state[StoreNames.USER]);
	const empty_profiles_count = Math.max(0, Math.min(max_profiles - profiles.length, max_profiles));

	const handleRemove = async (id: string) => {
		const removed = await AuthService.removeDevice(id);
		if (removed) {
			dispatch(removeProfile(id));
		}
		handleDeviceAdded();
	};

	const handleDeviceAdded = async () => {
		const { profiles, max_profiles } = await AuthService.profiles();
		if (profiles.length === 0) {
			dispatch(
				setUserDetails({
					current_profile: '',
					profiles: [],
					max_profiles: max_profiles,
				})
			);
			return;
		}
		dispatch(
			setUserDetails({
				profiles,
				current_profile: profiles[profiles.length - 1].client_id,
				max_profiles,
			})
		);
	};

	const logout = async () => {
		const isLoggedOut = await AuthService.logout();
		if (isLoggedOut) {
			navigate(NAVIGATION.WELCOME);
		}
	};

	useEffect(() => {
		if (!isAuthenticating) {
			addProfileRef.current?.close();
		}
	}, [isAuthenticating]);

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>
				<Flex width={'97%'} justifyContent={'space-between'} alignItems={'flex-end'}>
					Settings
					<Flex gap={'0.5rem'}>
						<Button variant='outline' colorScheme='red' onClick={logout} leftIcon={<IoLogOut />}>
							Logout
						</Button>
					</Flex>
				</Flex>
			</Heading>
			<Heading color={Colors.PRIMARY_DARK} size={'md'} marginTop={'3rem'}>
				Preferences
			</Heading>
			<VStack alignItems={'stretch'}>
				<FormControl mt={'1rem'} gap={'0.5rem'} display={'flex'}>
					<FormLabel htmlFor='auto-load' mb='0' mr='0'>
						Auto load Attachments
					</FormLabel>
					<Switch
						id='auto-load'
						isChecked={load_preview}
						onChange={(e) => dispatch(setUserConfig({ load_preview: e.target.checked }))}
					/>
				</FormControl>
				<FormControl mt={'1rem'} gap={'0.5rem'} display={'flex'}>
					<FormLabel htmlFor='confirmation' mb='0' mr='0'>
						Ask for Confirmation
					</FormLabel>
					<Switch
						id='confirmation'
						isChecked={confirmation_required}
						onChange={(e) => dispatch(setUserConfig({ confirmation_required: e.target.checked }))}
					/>
				</FormControl>
			</VStack>
			<Heading color={Colors.PRIMARY_DARK} size={'md'} marginTop={'3rem'}>
				Whatsapp Devices{' '}
			</Heading>

			<Wrap marginTop={'1rem'} gap={'1rem'}>
				<Each
					items={profiles}
					render={(item, index) => (
						<WrapItem>
							<Profile id={index + 1} {...item} onRemove={() => handleRemove(item.client_id)} />
						</WrapItem>
					)}
				/>
				{empty_profiles_count > 0 && (
					<WrapItem>
						<EmptyProfile
							onConnectClicked={() => {
								addDevice();
								addProfileRef.current?.open();
							}}
						/>
					</WrapItem>
				)}
			</Wrap>
			<AddDeviceDialog
				ref={addProfileRef}
				qr={qrCode}
				status={status}
				onCompleted={handleDeviceAdded}
			/>
		</Flex>
	);
}

function Profile({
	id,
	phone,
	name,
	onRemove,
}: {
	id: number;
	phone: string;
	name: string;
	onRemove: () => void;
}) {
	return (
		<Card width={'fit-content'} rounded={'xl'}>
			<CardBody paddingY={'0.5rem'}>
				<Heading size='sm' textAlign={'center'}>
					Profile {id}
				</Heading>
				<Image mx={'auto'} mt={'0.5rem'} src={WA_DEVICE} borderRadius='lg' height={'18rem'} />
				<Stack mt={'0.5rem'} spacing={'0.125rem'}>
					<HStack width={'full'}>
						<Text>Name: </Text>
						<Box display={'inline-block'} position={'relative'} width={'full'}>
							<Text
								className='whitespace-nowrap'
								overflow={'hidden'}
								width={'full'}
								maxWidth={'140px'}
								p={0}
							>
								<span className='font-medium'>{name}</span>
							</Text>
						</Box>
					</HStack>
					<HStack width={'full'}>
						<Text>
							Number: <span className='font-medium'>+{phone}</span>
						</Text>
					</HStack>
				</Stack>
			</CardBody>
			<Divider />
			<CardFooter padding={0} justifyContent={'center'}>
				<Button variant='unstyled' color={'red'} onClick={onRemove}>
					Logout
				</Button>
			</CardFooter>
		</Card>
	);
}

function EmptyProfile({ onConnectClicked }: { onConnectClicked: () => void }) {
	return (
		<Card width={'fit-content'} rounded={'xl'}>
			<CardBody paddingY={'0.5rem'}>
				<Heading size='sm' textAlign={'center'}>
					Add Profile
				</Heading>
				<Image mx={'auto'} mt={'0.5rem'} src={WA_AUTH} borderRadius='lg' height={'18rem'} />
				<Box height='3.7rem' width={'200px'} />
			</CardBody>
			<Divider />
			<CardFooter padding={0} justifyContent={'center'} onClick={onConnectClicked}>
				<Button variant='unstyled' color={Colors.ACCENT_DARK}>
					Connect
				</Button>
			</CardFooter>
		</Card>
	);
}
