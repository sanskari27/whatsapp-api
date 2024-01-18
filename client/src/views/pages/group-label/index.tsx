import { Box, Button, HStack, useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { BiGroup, BiLabel } from 'react-icons/bi';
import { MdGroups3 } from 'react-icons/md';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { CreateGroupDialog } from './components';

const GroupAndLabelPage = () => {
	const { onOpen, onClose, isOpen } = useDisclosure();

	useEffect(() => {
		pushToNavbar({
			title: 'Group and Label',
			icon: MdGroups3,
			actions: (
				<HStack>
					<Button size={'sm'} leftIcon={<BiGroup />} colorScheme='green' onClick={onOpen}>
						Create Group
					</Button>
					<Button size={'sm'} leftIcon={<BiLabel />} colorScheme='blue'>
						Assign Label
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [onOpen]);

	return (
		<Box>
			<CreateGroupDialog isOpen={isOpen} onClose={onClose} />
		</Box>
	);
};

export default GroupAndLabelPage;
