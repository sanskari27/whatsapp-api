import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PRIVACY } from '../../../assets/Images';
import { CheckButton } from './components';

const ENHANCEMENT = () => {
	const [message, setMessage] = useState(false);
	const [name, setName] = useState(false);
	const [photo, setPhoto] = useState(false);
	const [conversation, setConversation] = useState(false);
	return (
		<Flex direction={'column'} gap={'0.5rem'}>
			<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
				<Image src={PRIVACY} width={4} />
				<Text color='white' fontSize='md'>
					Privacy
				</Text>
			</Flex>
			<Box backgroundColor='#535353' p={'0.5rem'} borderRadius={'20px'}>
				<Flex flexDirection='column' gap={'0.25rem'}>
					<CheckButton label='Blur Recent Messages' value={message} setValue={setMessage} />
					<CheckButton label='Blur Contact Name' value={name} setValue={setName} />
					<CheckButton label='Blur Contact Photos' value={photo} setValue={setPhoto} />
					<CheckButton
						label='Blur Conversation Message'
						value={conversation}
						setValue={setConversation}
					/>
				</Flex>
			</Box>
		</Flex>
	);
};

export default ENHANCEMENT;
