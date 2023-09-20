import { Button, Flex, Input, VStack } from '@chakra-ui/react';
import { useState } from 'react';

const Welcome = () => {
	const [link, setLink] = useState('');
	return (
		<VStack width='400px' height='200px' paddingTop='50px'>
			<Button>Get started</Button>
			<Flex>
				<Input
					placeholder='paste the code here'
					value={link}
					onChange={(e) => setLink(e.target.value)}
				/>
				<Button>Submit</Button>
			</Flex>
		</VStack>
	);
};

export default Welcome;
