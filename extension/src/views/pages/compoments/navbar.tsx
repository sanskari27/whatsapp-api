import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';

const Navbar = () => {
	return (
		<Flex direction='column'>
			<Flex direction={'row'} justifyContent={'space-between'}>
				<Text>Extension</Text>
				<Box>s</Box>
			</Flex>
			<HStack>
				<Button>Welcome</Button>
				{/* <Button onClick={() => history.push(NAVIGATION.EXPORT)}>Export</Button>
				<Button onClick={() => history.push(NAVIGATION.ENHANCEMENT)}>Enhanchment</Button> */}
			</HStack>
		</Flex>
	);
};

export default Navbar;
