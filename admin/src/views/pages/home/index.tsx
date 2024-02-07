import { Box, Flex, Image, Progress, Text } from '@chakra-ui/react';
import Lottie from 'lottie-react';
import { useEffect } from 'react';
import { Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { LOTTIE_LOADER } from '../../../assets/Lottie';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';
import Dashboard from './Dashboard';

export default function Home() {
	const navigate = useNavigate();
	const status = useNetwork();
	const outlet = useOutlet();
	const { isAuthenticated, isValidating } = useAuth();

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	// const fetchUserDetails = useCallback(async () => {
	// 	try {
	// 		const promises = [
	// 			AuthService.getUserDetails(),
	// 			ContactCardService.ListContactCards(),
	// 			AttachmentService.getAttachments(),
	// 			UploadsService.listCSV(),
	// 			GroupService.listGroups(),
	// 			LabelService.listLabels(),
	// 			BotService.listBots(),
	// 			ShortenerService.listAll(),
	// 			GroupService.mergedGroups(),
	// 			addDelay(DATA_LOADED_DELAY),
	// 		];

	// 		const results = await Promise.all(promises);

	// 		dispatch(
	// 			setUserDetails({
	// 				...results[0],
	// 				groups: results[4],
	// 				labels: results[5],
	// 				contactsCount: null,
	// 			})
	// 		);
	// 		dispatch(setContactList(results[1]));
	// 		dispatch(setAttachments(results[2]));
	// 		dispatch(setCSVFileList(results[3]));
	// 		dispatch(setBots(results[6]));
	// 		dispatch(setLinksList(results[7]));
	// 		dispatch(setMergedGroupList(results[8]));
	// 		setDataLoaded.on();
	// 	} catch (e) {
	// 		navigate(NAVIGATION.WELCOME);
	// 		return;
	// 	}
	// }, [dispatch, navigate, setDataLoaded]);

	// useEffect(() => {
	// 	if (phoneNumber) {
	// 		setDataLoaded.on();
	// 		return;
	// 	}
	// 	setDataLoaded.off();
	// 	fetchUserDetails();
	// }, [phoneNumber, fetchUserDetails, setDataLoaded]);
	if (isValidating) {
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
				{outlet ? outlet : <Dashboard />}
				<Loading isLoaded={true} />
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
