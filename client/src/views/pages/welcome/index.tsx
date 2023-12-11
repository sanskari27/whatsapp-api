import { CheckIcon, ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Input, Progress, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { Navigate } from 'react-router-dom';
import { GREEN_SHADOW, LOGO, WELCOME_TYPING } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import useToken from '../../../hooks/useToken';
import QRLogo from '../../components/qr-logo';

export default function Welcome() {
	const { verifyToken, isLoading, tokenVerified } = useToken();
	const { isAuthenticated, isAuthenticating, qrCode, qrGenerated, isSocketInitialized } = useAuth();
	const [isError, setError] = useState(false);
	const [token, setToken] = useState('');
	const handleSubmit = () => {
		verifyToken(token, (err: boolean) => {
			if (err) {
				setError(true);
				return;
			}
		});
	};

	useEffect(() => {
		if (token.length > 0) setError(false);
	}, [token]);

	if (tokenVerified && isSocketInitialized) {
		return <Navigate to={NAVIGATION.HOME} />;
	}

	return (
		<>
			<ReactCardFlip isFlipped={tokenVerified} flipDirection='horizontal'>
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
							<Image src={WELCOME_TYPING} className='filter-none' width={'60%'} />H
						</Box>
						<Box
							width='250px'
							height='250px'
							display='flex'
							justifyContent={'center'}
							alignItems='center'
							position='relative'
							marginTop={'-225px'}
						>
							<Image src={WELCOME_TYPING} className='filter-none' width={'60%'} />
						</Box>

						<Text
							className='text-black dark:text-white'
							textTransform={'uppercase'}
							fontWeight='bold'
						>
							Click get started to get the coupon code
						</Text>
						<Button
							bgColor={'green.300'}
							width={'max-content'}
							marginTop={'1rem'}
							_hover={{
								bgColor: 'green.400',
							}}
							onClick={() => {
								window.open('https://bit.ly/FreeExtension');
							}}
						>
							<Text textColor='white' fontSize={'lg'} fontWeight='bold'>
								Get Started
							</Text>
							<ChevronRightIcon w={6} h={6} color='white' ml={'0.5rem'} />
						</Button>

						<Box
							display='flex'
							justifyContent='space-around'
							alignItems={'center'}
							marginTop={'1rem'}
						>
							<Input
								width={'50%'}
								isInvalid={isError}
								placeholder={'Paste the code here'}
								border={'none'}
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
								_placeholder={{ opacity: 0.4, color: 'inherit' }}
								_focus={{ border: 'none', outline: 'none' }}
								onChange={(e) => setToken(e.target.value)}
							/>
							<Button
								isLoading={isLoading}
								bgColor={'green.300'}
								width={'35%'}
								_hover={{
									bgColor: 'green.400',
								}}
								onClick={handleSubmit}
							>
								<CheckIcon w={3} h={3} color='white' mr={'0.5rem'} />
								<Text textColor='white' fontWeight='medium'>
									Submit
								</Text>
							</Button>
						</Box>
						<Box marginTop={'1rem'} width={'450px'} display='flex' gap={'1rem'}>
							<InfoOutlineIcon color='#4CB072' marginTop='0.2rem' />
							<Text className='text-gray-700 dark:text-gray-300' fontSize={'small'}>
								You will be redirected to a WhatsApp chat with a message. Send that message to Get
								The Coupon Code
							</Text>
						</Box>
					</Flex>
				</Flex>
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
								justifyContent={'center'}
								alignItems={'center'}
								direction={'column'}
								gap={'3rem'}
							>
								<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
									<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
									<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
										WhatsLeads
									</Text>
								</Flex>

								<Button
									bgColor={'blue.300'}
									_hover={{
										bgColor: 'blue.400',
									}}
									onClick={startAuth}
									width={'100%'}
								>
									<Flex gap={'0.5rem'}>
										<Text color={'white'}>Login</Text>
									</Flex>
								</Button>
							</Flex>
						) : qrGenerated ? (
							<>
								<QRLogo base64Data={qrCode} logoUrl={LOGO} />
							</>
						) : (
							<Flex
								justifyContent={'center'}
								alignItems={'center'}
								direction={'column'}
								gap={'3rem'}
							>
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
			</ReactCardFlip>
		</>
	);
}
