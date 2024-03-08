import { Button, FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Colors } from '../../../../config/const';
import { createUser, useAuth } from '../../../../hooks/useAuth';
import { PasswordInput } from './PasswordInput';

export default function SignupTab() {
	const { isAuthenticating } = useAuth();
	const [{ username, password, name, phone, confirm_password }, setCredentials] = useState({
		username: '',
		password: '',
		confirm_password: '',
		name: '',
		phone: '',
	});

	const [
		{ usernameError, passwordError, loginError, confirm_passwordError, nameError, phoneError },
		setUIDetails,
	] = useState({
		usernameError: false,
		passwordError: false,
		nameError: false,
		phoneError: false,
		confirm_passwordError: false,
		loginError: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCredentials((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
		setUIDetails((prev) => ({
			...prev,
			loginError: '',
			[e.target.name + 'Error']: false,
		}));
	};

	const handleSignup = async () => {
		if (!username || !password || !name || !phone || !confirm_password) {
			return setUIDetails({
				usernameError: !username,
				passwordError: !password,
				phoneError: !phone,
				nameError: !name,
				confirm_passwordError: !confirm_password,
				loginError: '',
			});
		}

		if (password !== confirm_password) {
			return setUIDetails((prev) => ({
				...prev,
				passwordError: true,
				confirm_passwordError: true,
			}));
		}

		const error = await createUser({ username, password, phone, name });
		if (!error) {
			return;
		}
		setUIDetails((prev) => ({
			...prev,
			usernameError: error.includes('Username'),
			phoneError: error.includes('Phone number'),
			loginError: error,
		}));
	};
	return (
		<>
			<Stack width={'full'} spacing='6'>
				<Stack spacing='2'>
					<FormControl isInvalid={nameError}>
						<FormLabel htmlFor='email' color={Colors.PRIMARY_DARK}>
							Name
						</FormLabel>
						<Input
							type='text'
							name='name'
							value={name}
							variant='unstyled'
							bgColor={Colors.ACCENT_LIGHT}
							onChange={handleChange}
							placeholder='Full Name'
							_placeholder={{
								color: nameError ? 'red.400' : Colors.ACCENT_DARK,
								opacity: 0.7,
							}}
							borderColor={nameError ? 'red' : Colors.ACCENT_DARK}
							borderWidth={'1px'}
							padding={'0.5rem'}
							marginTop={'-0.5rem'}
						/>
					</FormControl>
					<FormControl isInvalid={phoneError}>
						<FormLabel htmlFor='email' color={Colors.PRIMARY_DARK}>
							Phone Number
						</FormLabel>
						<Input
							type='tel'
							name='phone'
							value={phone}
							variant='unstyled'
							bgColor={Colors.ACCENT_LIGHT}
							onChange={handleChange}
							placeholder='Phone Number'
							_placeholder={{
								color: phoneError ? 'red.400' : Colors.ACCENT_DARK,
								opacity: 0.7,
							}}
							borderColor={phoneError ? 'red' : Colors.ACCENT_DARK}
							borderWidth={'1px'}
							padding={'0.5rem'}
							marginTop={'-0.5rem'}
						/>
					</FormControl>
					<FormControl isInvalid={usernameError}>
						<FormLabel htmlFor='email' color={Colors.PRIMARY_DARK}>
							Username
						</FormLabel>
						<Input
							type='email'
							name='username'
							value={username}
							variant='unstyled'
							bgColor={Colors.ACCENT_LIGHT}
							onChange={handleChange}
							placeholder='username'
							_placeholder={{
								color: usernameError ? 'red.400' : Colors.ACCENT_DARK,
								opacity: 0.7,
							}}
							borderColor={usernameError ? 'red' : Colors.ACCENT_DARK}
							borderWidth={'1px'}
							padding={'0.5rem'}
						/>
					</FormControl>
					<PasswordInput
						isInvalid={passwordError}
						name='password'
						value={password}
						onChange={handleChange}
						placeholder='********'
					/>
					<PasswordInput
						label='Confirm Password'
						isInvalid={confirm_passwordError}
						name='confirm_password'
						value={confirm_password}
						onChange={handleChange}
						placeholder='********'
					/>
				</Stack>

				<Stack spacing='0'>
					<Text color={'red'} textAlign={'center'}>
						{loginError}
					</Text>
					<Button
						onClick={handleSignup}
						colorScheme={loginError ? 'red' : 'green'}
						isLoading={isAuthenticating}
					>
						Sign Up
					</Button>
					T
				</Stack>
			</Stack>
		</>
	);
}
