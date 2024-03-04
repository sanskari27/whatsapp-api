import {
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import GroupService from '../../../../services/group.service';
import { StoreNames, StoreState } from '../../../../store';

export type CreateGroupDialogHandler = {
	open: () => void;
	close: () => void;
};

const CreateGroupDialog = forwardRef<CreateGroupDialogHandler>((_, ref) => {
	const { onOpen, onClose, isOpen } = useDisclosure();
	useImperativeHandle(ref, () => ({
		open: () => {
			onOpen();
		},
		close: () => {
			onClose();
		},
	}));

	const [groupDetails, setGroupDetails] = useState({
		groupName: '',
		csvId: '',
		error: '',
	});

	const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);

	const handleChange = (name: string, value: string) => {
		setGroupDetails((prev) => ({
			...prev,
			[name]: value,
			error: '',
		}));
	};

	const handleCreateGroup = () => {
		if (groupDetails.groupName === '' || groupDetails.csvId === '') {
			setGroupDetails((prev) => ({
				...prev,
				error: 'Please fill all the fields',
			}));
			return;
		}
		GroupService.createGroup(groupDetails.groupName, groupDetails.csvId).then((res) => {
			if (!res) {
				setGroupDetails((prev) => ({
					...prev,
					error: 'Something went wrong',
				}));
				return;
			}
			onClose();
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Create Group</ModalHeader>
				<ModalBody>
					<FormControl>
						<FormLabel>Group Name</FormLabel>
						<Input
							name={groupDetails.groupName}
							value={groupDetails.groupName}
							onChange={(e) => handleChange('groupName', e.target.value)}
						/>
					</FormControl>
					<FormControl mt={'2rem'}>
						<FormLabel>Select Recipients from CSV</FormLabel>
						<Select
							name={groupDetails.csvId}
							onChange={(e) => handleChange('csvId', e.target.value)}
						>
							<option>Select CSV</option>
							{list.map((item) => (
								<option key={item.fileName} value={item.fileName}>
									{item.name}
								</option>
							))}
						</Select>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					{groupDetails.error && <Text color={'tomato'}>{groupDetails.error}</Text>}
					<Button colorScheme='red' mr={3} onClick={onClose}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={handleCreateGroup}>
						Create
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default CreateGroupDialog;
