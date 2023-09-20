import { Box, Button, Image, Input, Text } from '@chakra-ui/react';
import { GREEN_SHADOW, LOGO, SETTINGS, WELCOME_TYPING } from '../../../assets/Images';
import { CheckIcon, ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import useToken from '../../../hooks/useToken';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Welcome() {
	const { verifyToken, isLoading, tokenVerified } = useToken();
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

	if (tokenVerified) {
		return <Navigate to={NAVIGATION.HOME} />;
	}

	return (
		<Box width='full' py={'1rem'} px={'1.5rem'}>
			<Box width='full' height='full' display='flex' gap={'1rem'} alignItems='center'>
				<Image src={LOGO} width={9} />
				<Text className='text-black dark:text-white' flexGrow={1} fontSize={'lg'} fontWeight='bold'>
					Whatsapp Help
				</Text>
				<Image src={SETTINGS} width={4} height={4} />
			</Box>

			<Box
				width='full'
				height='250px'
				display='flex'
				gap={'1rem'}
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
				width='full'
				height='250px'
				display='flex'
				gap={'1rem'}
				justifyContent={'center'}
				alignItems='center'
				position='relative'
				marginTop={'-250px'}
			>
				<Image src={WELCOME_TYPING} className='filter-none' width={'60%'} />
			</Box>

			<Box width={'60%'} marginTop={'-30px'}>
				<Text className='text-black dark:text-white' textTransform={'uppercase'} fontWeight='bold'>
					Click the get started to get the coupon code and
				</Text>
				<Text textColor='green.400' textTransform={'uppercase'} fontSize={'lg'} fontWeight='bold'>
					get started
				</Text>
			</Box>

			<Button
				bgColor={'green.300'}
				width={'full'}
				marginTop={'1rem'}
				_hover={{
					bgColor: 'green.400',
				}}
			>
				<Text textColor='white' fontSize={'lg'} fontWeight='bold'>
					Get Started
				</Text>
				<ChevronRightIcon w={6} h={6} color='white' ml={'0.5rem'} />
			</Button>

			<Box display='flex' justifyContent='space-between' alignItems={'center'} marginTop={'1rem'}>
				<Input
					width={'65%'}
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
					width={'30%'}
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
			<Box marginTop={'1rem'} display='flex' gap={'1rem'}>
				<InfoOutlineIcon color='#4CB072' marginTop='0.2rem' />
				<Text className='text-gray-700 dark:text-gray-300'>
					You will be redirected to a WhatsApp chat with a message. Send that message to Get The
					Coupon Code
				</Text>
			</Box>
		</Box>
	);
}
