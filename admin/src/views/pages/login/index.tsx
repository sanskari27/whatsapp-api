import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Image,
	Input,
	Progress,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { startAuth, useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import { useTheme } from '../../../hooks/useTheme';
import { PasswordField } from './components/PasswordField';

export default function Admin() {
	const status = useNetwork();
	const navigate = useNavigate();
	const theme = useTheme();
	const { isAuthenticated, isAuthenticating, isValidating } = useAuth();
	const [{ username, password }, setCredentials] = useState({
		username: '',
		password: '',
	});

	const [{ usernameError, passwordError, loginError }, setUIDetails] = useState({
		usernameError: false,
		passwordError: false,
		loginError: false,
	});

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	if (isAuthenticated) {
		return <Navigate to={NAVIGATION.HOME} />;
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCredentials((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
		setUIDetails((prev) => ({
			...prev,
			[e.target.name + 'Error']: false,
		}));
	};

	const handleLogin = async () => {
		if (!username || !password) {
			return setUIDetails({
				usernameError: !username,
				passwordError: !password,
				loginError: false,
			});
		}
		const valid = await startAuth(username, password);
		if (!valid) {
			setUIDetails({
				passwordError: true,
				usernameError: true,
				loginError: true,
			});
			setTimeout(() => {
				setUIDetails({
					passwordError: false,
					usernameError: false,
					loginError: false,
				});
			}, 2000);
		}
	};

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
					height={'400px'}
					className='border shadow-xl drop-shadow-xl transition-all'
				>
					{!isValidating ? (
						<Stack>
							<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
								<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
								<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
									WhatsLeads
								</Text>
							</Flex>

							<Stack spacing='6' marginTop={'2rem'}>
								<Stack spacing='5'>
									<FormControl isInvalid={usernameError}>
										<FormLabel htmlFor='email' color={theme === 'dark' ? 'gray' : 'black'}>
											Username
										</FormLabel>
										<Input
											id='email'
											type='email'
											name='username'
											value={username}
											color={theme === 'dark' ? 'white' : 'black'}
											onChange={handleChange}
										/>
									</FormControl>
									<PasswordField
										isInvalid={passwordError}
										name='password'
										value={password}
										onChange={handleChange}
									/>
								</Stack>

								<Stack spacing='6'>
									<Button
										onClick={handleLogin}
										colorScheme={loginError ? 'red' : 'green'}
										isLoading={isAuthenticating}
									>
										Sign in
									</Button>
								</Stack>
							</Stack>
						</Stack>
					) : (
						<Loading />
					)}
				</Flex>
			</Flex>
		</>
	);
}

function Loading() {
	return (
		<Flex justifyContent={'center'} alignItems={'center'} direction={'column'} gap={'3rem'}>
			<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
				<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
				<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
					WhatsLeads
				</Text>
			</Flex>
			<Progress size='xs' isIndeterminate width={'150%'} rounded={'lg'} />
		</Flex>
	);
}
