import {
	Button,
	Checkbox,
	Flex,
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
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../store';

export type ContactDialogHandle = {
	open: (ids: string[]) => void;
	close: () => void;
};

type Props = {
	onConfirm: (ids: string[]) => void;
};

const ContactSelectorDialog = forwardRef<ContactDialogHandle, Props>(
	({ onConfirm }: Props, ref) => {
		const [selected, setSelected] = useState<string[]>([]);
		const { list } = useSelector((state: StoreState) => state[StoreNames.CONTACT_CARD]);
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

		return (
			<Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Select Contacts</ModalHeader>
					<ModalBody>
						<TableContainer>
							<Table>
								<Thead>
									<Tr>
										<Th>Sl no</Th>
										<Th>First Name</Th>
										<Th>Last Name</Th>
										<Th>Phone</Th>
									</Tr>
								</Thead>
								<Tbody>
									{list.map((item, index) => (
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
											<Td>{item.first_name}</Td>
											<Td>{item.last_name}</Td>
											<Td>
												{`${item.contact_details_phone?.country_code} ${item.contact_details_phone?.number}`}
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</ModalBody>

					<ModalFooter>
						<Flex justifyContent={'space-between'} width={'100%'}>
							<Flex>
								<Button colorScheme='yellow' mr={3} onClick={() => setSelected([])}>
									Deselect All
								</Button>
								<Button
									colorScheme='blue'
									mr={3}
									onClick={() => setSelected(list.map((el) => el.id))}
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

export default ContactSelectorDialog;
