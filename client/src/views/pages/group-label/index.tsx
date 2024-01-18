import { Box, HStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { MdGroups3 } from 'react-icons/md';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';

const GroupAndLabelPage = () => {
	useEffect(() => {
		pushToNavbar({
			title: 'Group and Label',
			icon: MdGroups3,
			actions: <HStack></HStack>,
		});
		return () => {
			popFromNavbar();
		};
	}, []);

	return <Box></Box>;
};

export default GroupAndLabelPage;
