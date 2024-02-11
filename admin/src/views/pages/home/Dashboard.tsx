import { Grid, GridItem } from '@chakra-ui/react';
import { useTheme } from '../../../hooks/useTheme';
import PromotionalMessage from './components/PromotionalMessage';
import Token from './components/Token';

export default function Dashboard() {
	const theme = useTheme();

	return (
		<Grid p={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'} gap={'1rem'}>
			<GridItem>
				<Token />
			</GridItem>
			<GridItem>
				<PromotionalMessage />
			</GridItem>
		</Grid>
	);
}
