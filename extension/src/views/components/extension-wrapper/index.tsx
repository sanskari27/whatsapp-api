import { Box } from '@chakra-ui/react';

type ExtensionWrapperProps = {
	children: React.ReactNode;
};

export default function ExtensionWrapper({ children }: ExtensionWrapperProps): JSX.Element {
	return (
		<>
			<Box width='400px' minHeight='400px' className='bg-background dark:bg-background-dark'>
				{children}
			</Box>
		</>
	);
}
