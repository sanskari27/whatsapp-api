import { Box, Button, HStack, useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { MdGroupAdd, MdGroups3 } from 'react-icons/md';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import GroupMerge from './components/group-merge-dialog';

const GroupAndLabelPage = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		pushToNavbar({
			title: 'Group Merge',
			icon: MdGroups3,
			actions: (
				<HStack>
					<Button leftIcon={<MdGroupAdd />} size={'sm'} colorScheme='blue' onClick={onOpen}>
						Merge Group
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
			<GroupMerge isOpen={isOpen} onClose={onClose} />
		</Box>
	);
};

export default GroupAndLabelPage;
