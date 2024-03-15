import { Flex, Image, Progress, Text } from '@chakra-ui/react';
import { LOGO } from '../../../assets/Images';
import { Colors } from '../../../config/const';

export default function LoadingPage() {
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
				<Flex justifyContent={'center'} alignItems={'center'} direction={'column'} gap={'3rem'}>
					<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
						<Image src={LOGO} width={'48px'} />
						<Text fontSize={'lg'} fontWeight='bold' color={Colors.ACCENT_DARK}>
							wpautomation.tech
						</Text>
					</Flex>
					<Progress size='xs' isIndeterminate width={'150%'} rounded={'lg'} colorScheme='gray' />
				</Flex>
			</Flex>
		</Flex>
	);
}
