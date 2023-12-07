import { Flex } from '@chakra-ui/react';

type PageWrapperProps = {
	children: React.ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
	return (
		<Flex minHeight={'100vh'} width={'100vw'} className='bg-background dark:bg-background-dark'>
			{children}
		</Flex>
	);
};

export default PageWrapper;
