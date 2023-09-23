import { useNavigate } from 'react-router';
import { BACK } from '../../../assets/Images';
import { Flex, Button, Image, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const BackButton = () => {
	const navigate = useNavigate();
	return (
		<Flex>
			<Button
				variant={'link'}
				alignSelf={'flex-start'}
				onClick={() => navigate(-1)}
				paddingX={0}
				marginLeft={'-0.75rem'}
			>
				<ArrowBackIcon width={6} height={6} className='text-gray-800 dark:text-gray-200' />
			</Button>
			<Flex>
				<Text fontSize={'lg'} fontWeight={'semibold'} className='text-[#4CB072]' mr={'0.5rem'}>
					Pay
				</Text>
				<Text fontSize={'lg'} fontWeight={'semibold'} className='text-black dark:text-white'>
					To Use The Feature
				</Text>
			</Flex>
		</Flex>
	);
};
export default BackButton;
