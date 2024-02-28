import { Box, Flex, Image, Progress, Text, useBoolean } from '@chakra-ui/react';
import Lottie from 'lottie-react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { LOTTIE_LOADER } from '../../../assets/Lottie';
import { DATA_LOADED_DELAY, NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import useTask from '../../../hooks/useTask';
import '../../../index.css';
import AttachmentService from '../../../services/attachment.service';
import BotService from '../../../services/bot.service';
import ContactCardService from '../../../services/contact-card.service';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import MessageService from '../../../services/message.service';
import ShortenerService from '../../../services/shortener.service';
import UploadsService from '../../../services/uploads.service';
import UserService from '../../../services/user.service';
import { StoreNames, StoreState } from '../../../store';
import { setAttachments } from '../../../store/reducers/AttachmentReducers';
import { setBots } from '../../../store/reducers/BotReducers';
import { setCSVFileList } from '../../../store/reducers/CSVFileReducers';
import { setContactList } from '../../../store/reducers/ContactCardReducers';
import { setLinksList } from '../../../store/reducers/LinkShortnerReducers';
import { setMergedGroupList } from '../../../store/reducers/MergeGroupReducer';
import { setAllSchedulers } from '../../../store/reducers/SchedulerReducer';
import { setUserDetails } from '../../../store/reducers/UserDetailsReducers';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';

export default function Home() {
	const navigate = useNavigate();
	const status = useNetwork();
	const outlet = useOutlet();
	const dispatch = useDispatch();
	useTask();
	const { isAuthenticated, isAuthenticating } = useAuth();
	const { phoneNumber } = useSelector((state: StoreState) => state[StoreNames.USER]);
	const [dataLoaded, setDataLoaded] = useBoolean(false);
	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	const fetchUserDetails = useCallback(async () => {
		try {
			const promises = [
				UserService.getUserDetails(),
				ContactCardService.ListContactCards(),
				AttachmentService.getAttachments(),
				UploadsService.listCSV(),
				GroupService.listGroups(),
				LabelService.listLabels(),
				BotService.listBots(),
				ShortenerService.listAll(),
				GroupService.mergedGroups(),
				MessageService.getScheduledMessages(),
				addDelay(DATA_LOADED_DELAY),
			];

			const results = await Promise.all(promises);

			dispatch(
				setUserDetails({
					...results[0],
					groups: results[4],
					labels: results[5],
					contactsCount: null,
				})
			);
			dispatch(setContactList(results[1]));
			dispatch(setAttachments(results[2]));
			dispatch(setCSVFileList(results[3]));
			dispatch(setBots(results[6]));
			dispatch(setLinksList(results[7]));
			dispatch(setMergedGroupList(results[8]));
			dispatch(setAllSchedulers(results[9]));
			setDataLoaded.on();
		} catch (e) {
			navigate(NAVIGATION.WELCOME);
			return;
		}
	}, [dispatch, navigate, setDataLoaded]);

	useEffect(() => {
		if (phoneNumber) {
			setDataLoaded.on();
			return;
		}
		setDataLoaded.off();
		fetchUserDetails();
	}, [phoneNumber, fetchUserDetails, setDataLoaded]);

	if (isAuthenticating) {
		return (
			<Flex
				justifyContent={'center'}
				alignItems={'center'}
				direction={'column'}
				gap={'3rem'}
				width={'full'}
			>
				<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
					<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
					<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
						WhatsLeads
					</Text>
				</Flex>
				<Progress size='xs' isIndeterminate width={'30%'} rounded={'lg'} />
			</Flex>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to={NAVIGATION.WELCOME} />;
	}

	return (
		<Box width='full' className='custom-scrollbar'>
			<NavigationDrawer />
			<Navbar />
			<Box paddingLeft={'70px'} paddingTop={'70px'} overflowX={'hidden'} className='min-h-screen'>
				{outlet ? outlet : <Navigate to={NAVIGATION.CONTACT} />}
				<Loading isLoaded={dataLoaded} />
			</Box>
		</Box>
	);
}

function Loading({ isLoaded }: { isLoaded: boolean }) {
	if (isLoaded) {
		return null;
	}
	return (
		<Flex
			justifyContent={'center'}
			alignItems={'center'}
			direction={'column'}
			position={'fixed'}
			gap={'3rem'}
			height={'100vh'}
			width={'100vw'}
			left={0}
			top={0}
			zIndex={99}
			userSelect={'none'}
			className='bg-black/50'
		>
			<Flex
				direction={'column'}
				justifyContent={'center'}
				alignItems={'center'}
				bg={'#f2f2f2'}
				paddingX={'4rem'}
				paddingTop={'4rem'}
				paddingBottom={'2rem'}
				aspectRatio={'1/1'}
				rounded={'lg'}
			>
				<Lottie animationData={LOTTIE_LOADER} loop={true} />
				<Text className='text-black ' fontSize={'lg'} fontWeight='bold'>
					WhatsLeads
				</Text>
				<Text mt={'1rem'} className='text-black ' fontSize={'xs'}>
					Data synchronization in progress.
				</Text>
				<Text className='text-black ' fontSize={'xs'}>
					It may take longer to complete.
				</Text>
			</Flex>
		</Flex>
	);
}

function addDelay(delay: number) {
	return new Promise((resolve: (value?: null) => void) => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}
