import { SearchIcon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../store';

export type AttachmentDialogHandle = {
	open: (ids: string[]) => void;
	close: () => void;
};

type Props = {
	onConfirm: (ids: string[]) => void;
};

const AttachmentSelectorDialog = forwardRef<AttachmentDialogHandle, Props>(
	({ onConfirm }: Props, ref) => {
		const [searchText, setSearchText] = useState<string>('');
		const [selected, setSelected] = useState<string[]>([]);
		const { attachments } = useSelector((state: StoreState) => state[StoreNames.ATTACHMENT]);
		const [isOpen, setOpen] = useState(false);
		const onClose = () => {
			setSelected([]);
			setOpen(false);
		};

		const handleAdd = () => {
			onConfirm(selected);
			setSelected([]);
			onClose();
		};

		useImperativeHandle(ref, () => ({
			open: (ids: string[]) => {
				setSelected(ids);
				setOpen(true);
			},
			close: () => {
				setOpen(false);
			},
		}));

		const filtered = attachments.filter(({ name }) =>
			name.toLowerCase().startsWith(searchText.toLowerCase())
		);

		return (
			<Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						<Flex alignItems={'center'} justifyContent={'space-between'} direction={'row'}>
							<Text>Select Attachments</Text>
							<InputGroup size='sm' variant={'outline'} width={'250px'}>
								<InputLeftElement pointerEvents='none'>
									<SearchIcon color='gray.300' />
								</InputLeftElement>
								<Input
									placeholder='Search here...'
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									borderRadius={'5px'}
									focusBorderColor='gray.300'
								/>
							</InputGroup>
						</Flex>
					</ModalHeader>
					<ModalBody>
						<TableContainer>
							<Table>
								<Thead>
									<Tr>
										<Th width={'10%'}>Sl no</Th>
										<Th width={'40%'}>Name</Th>
										<Th width={'40%'}>Caption</Th>
										<Th width={'10%'}>Custom Caption</Th>
									</Tr>
								</Thead>
								<Tbody>
									{filtered.map((item, index) => (
										<Tr key={item.id}>
											<Td>
												<Checkbox
													isChecked={selected.includes(item.id)}
													mr={4}
													onChange={(e) => {
														if (e.target.checked) {
															setSelected((prev) => [...prev, item.id]);
														} else {
															setSelected((prev) => prev.filter((i) => i !== item.id));
														}
													}}
												/>
												{index + 1}
											</Td>
											<Td>{item.name}</Td>
											<Td>{item.caption}</Td>
											<Td>{item.custom_caption ? 'Yes' : 'No'}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</ModalBody>

					<ModalFooter>
						<Flex justifyContent={'space-between'} width={'100%'}>
							<Flex>
								<Button
									colorScheme='yellow'
									textColor={'white'}
									mr={3}
									onClick={() => setSelected([])}
								>
									Deselect All
								</Button>
								<Button
									colorScheme='blue'
									mr={3}
									onClick={() => setSelected(attachments.map((el) => el.id))}
								>
									Select All
								</Button>
							</Flex>
							<Flex>
								<Button colorScheme='red' mr={3} onClick={onClose}>
									Cancel
								</Button>
								<Button colorScheme='green' onClick={handleAdd}>
									Confirm
								</Button>
							</Flex>
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}
);

export default AttachmentSelectorDialog;
