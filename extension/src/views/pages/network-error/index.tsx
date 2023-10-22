import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Image, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GREEN_SHADOW, NETWORK_ERROR } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { recheckNetwork, useNetwork } from '../../../hooks/useNetwork';
import Header from '../../components/header';

export default function NetworkError() {
	const navigate = useNavigate();
	const status = useNetwork();

	useEffect(() => {
		if (status === 'RUNNING') {
			navigate(NAVIGATION.WELCOME);
		}
	}, [status, navigate]);

	return (
		<Box width='full' py={'1rem'} px={'1.5rem'}>
			<Header />

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
				<Image src={NETWORK_ERROR} className='filter-none' width={'60%'} />
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
				<Image src={NETWORK_ERROR} className='filter-none' width={'60%'} />
			</Box>

			<Text
				className='text-black dark:text-white'
				fontSize={'large'}
				fontWeight={'medium'}
				textAlign={'center'}
			>
				Unable to connect to Servers
			</Text>

			<Text
				className='text-gray-700 dark:text-gray-300'
				fontWeight={'medium'}
				fontSize={'large'}
				textAlign={'center'}
				cursor={'pointer'}
				onClick={recheckNetwork}
			>
				<RepeatIcon mr={1} />
				refresh
			</Text>
		</Box>
	);
}
