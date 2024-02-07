import { Box } from '@chakra-ui/react';
import { useTheme } from '../../../hooks/useTheme';
import Token from './components/Token';

export default function Dashboard() {
	const theme = useTheme();

	return (
		<Box p={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
			<Token />
		</Box>
	);
}
