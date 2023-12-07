import { Box } from '@chakra-ui/react';
import { useTheme } from '../../../hooks/useTheme';

export default function Exporter() {
	const theme = useTheme();

	return <Box>{theme}</Box>;
}
