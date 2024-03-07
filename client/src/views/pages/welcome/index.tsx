import { Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import LoadingPage from '../../components/loading-page';
import QRLogo from '../../components/qr-image';

export default function Welcome() {
	const status = useNetwork();
	const navigate = useNavigate();
	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated, isSocketInitialized } = useAuth();

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	useEffect(() => {
		if (!isAuthenticating && !isAuthenticated) {
			startAuth();
		}
	}, [isAuthenticating, isAuthenticated]);

	if (isSocketInitialized) {
		return <Navigate to={NAVIGATION.HOME} />;
	}

	if (qrGenerated) {
		return (
			<Flex
				direction={'column'}
				justifyContent={'center'}
				alignItems={'center'}
				flexDirection='column'
				width={'100vw'}
				height={'100vh'}
			>
				<Flex
					direction={'column'}
					justifyContent={'center'}
					alignItems={'center'}
					flexDirection='column'
					padding={'3rem'}
					rounded={'lg'}
					width={'500px'}
					height={'500px'}
					className='border shadow-xl drop-shadow-xl '
				>
					<QRLogo base64Data={qrCode} logoUrl={LOGO} />
					<Text color={'whitesmoke'}>Connect Whatsleads to Whatsapp</Text>
				</Flex>
			</Flex>
		);
	}

	return <LoadingPage />;
}
