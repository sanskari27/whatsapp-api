import { Alert, AlertIcon, Box, Flex, Text } from '@chakra-ui/react';
import Lottie from 'lottie-react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { LOTTIE_LOADER } from '../../../assets/Lottie';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import { StoreNames, StoreState } from '../../../store';
import LoadingPage from '../../components/loading-page';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';

export default function Home() {
	const navigate = useNavigate();
	const status = useNetwork();
	const outlet = useOutlet();
	const { isAuthenticated, isAuthenticating } = useAuth();

	const { data_loaded } = useSelector((state: StoreState) => state[StoreNames.USER]);

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	if (isAuthenticating) {
		return <LoadingPage />;
	}

	if (!isAuthenticated) {
		return <Navigate to={NAVIGATION.WELCOME} />;
	}

	return (
		<Box width='full' className='custom-scrollbar bg-background'>
			<NavigationDrawer />
			<Navbar />
			<Box paddingLeft={'320px'} paddingTop={'65px'} overflowX={'hidden'} className='min-h-screen'>
				{outlet ? outlet : <Navigate to={NAVIGATION.DASHBOARD + NAVIGATION.CAMPAIGN_REPORTS} />}
				<Loading isLoaded={data_loaded} />
			</Box>
			<DevicesAlert />
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
					WPautomation
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

function DevicesAlert() {
	const { profiles } = useSelector((state: StoreState) => state[StoreNames.USER]);
	return (
		<Alert
			position={'absolute'}
			bottom={0}
			left={0}
			hidden={profiles.length !== 0}
			status='warning'
			rounded={'md'}
		>
			<Flex justifyContent={'space-between'} width={'full'}>
				<Flex>
					<AlertIcon />
					Seems no profile has been added.
				</Flex>
				<Link
					to={NAVIGATION.SETTINGS + NAVIGATION.PROFILES}
					className='transition-all hover:text-black hover:font-medium hover:no-underline'
				>
					Add Profile
				</Link>
			</Flex>
		</Alert>
	);
}
