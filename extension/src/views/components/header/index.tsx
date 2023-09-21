import { Box, Image, Text } from '@chakra-ui/react';
import { LOGO, SETTINGS } from '../../../assets/Images';

export default function Header() {
	return (
		<Box width='full' height='full' display='flex' gap={'1rem'} alignItems='center'>
			<Image src={LOGO} width={9} />
			<Text className='text-black dark:text-white' flexGrow={1} fontSize={'lg'} fontWeight='bold'>
				Whatsapp Help
			</Text>
			<Image src={SETTINGS} width={4} height={4} className='invert dark:invert-0' />
		</Box>
	);
}
