import { ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Progress, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GREEN_SHADOW, LOGO, WELCOME_TYPING } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import QRLogo from '../../components/qr-logo';

export default function Welcome() {
	const status = useNetwork();
	const navigate = useNavigate();
	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated, isSocketInitialized } = useAuth();

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	if (isSocketInitialized) {
		return <Navigate to={NAVIGATION.HOME} />;
	}

	return (
		<>
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
					height={'550px'}
					className='border shadow-xl drop-shadow-xl '
				>
					{!isAuthenticating && !isAuthenticated ? (
						<Flex
							direction={'column'}
							justifyContent={'center'}
							alignItems={'center'}
							flexDirection='column'
							padding={'3rem'}
							rounded={'lg'}
							width={'500px'}
							height={'550px'}
						>
							<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
								<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
								<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
									WhatsLeads
								</Text>
							</Flex>
							<Box
								width='250px'
								height='250px'
								display='flex'
								justifyContent={'center'}
								alignItems='center'
								className='blur-sm'
								position='relative'
								backgroundRepeat={'no-repeat'}
								backgroundPosition={'center'}
								backgroundSize={'contain'}
								backgroundImage={`url(${GREEN_SHADOW})`}
							>
								<Image src={WELCOME_TYPING} className='filter-none' width={'60%'} />
							</Box>
							<Box
								width='250px'
								height='250px'
								display='flex'
								justifyContent={'center'}
								alignItems='center'
								position='relative'
								marginTop={'-250px'}
							>
								<Image src={WELCOME_TYPING} className='filter-none' width={'60%'} />
							</Box>
							<Button
								bgColor={'green.300'}
								width={'max-content'}
								marginTop={'1rem'}
								_hover={{
									bgColor: 'green.400',
								}}
								onClick={startAuth}
							>
								<Text textColor='white' fontSize={'lg'} fontWeight='bold'>
									Get Started
								</Text>
								<ChevronRightIcon w={6} h={6} color='white' ml={'0.5rem'} />
							</Button>
						</Flex>
					) : qrGenerated ? (
						<>
							<QRLogo base64Data={qrCode} logoUrl={LOGO} />
						</>
					) : (
						<Flex justifyContent={'center'} alignItems={'center'} direction={'column'} gap={'3rem'}>
							<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
								<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
								<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
									WhatsLeads
								</Text>
							</Flex>
							<Progress size='xs' isIndeterminate width={'150%'} rounded={'lg'} />
						</Flex>
					)}
				</Flex>
			</Flex>
		</>
	);
}
