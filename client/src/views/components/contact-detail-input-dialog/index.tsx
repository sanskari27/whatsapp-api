import {
    Box,
    Button,
    Checkbox,
    Modal,
    ModalBody,
    ModalCloseButton,
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

export type SelectContactListHandle = {
    open: () => void;
    close: () => void;
    setIds: (ids: string[]) => void;
    ids: string[];
};

type Props = {
    type: 'Attachments' | 'Contacts';
    onConfirm: () => void;
};

const SelectContactsList = forwardRef<SelectContactListHandle, Props>(
    ({ type, onConfirm }: Props, ref) => {
        const [isOpen, setOpen] = useState(false);
        const onClose = () => {
            setId([]);
            setOpen(false);
        };
        const [id, setId] = useState<string[]>([]);

        const { list } = useSelector(
            (state: StoreState) => state[StoreNames.CONTACT_CARD]
        );

        const handleAdd = () => {
            setId([]);
            onConfirm();
            onClose();
        };

        useImperativeHandle(ref, () => ({
            open: () => {
                setOpen(true);
            },
            close: () => {
                setOpen(false);
            },
            setIds: (id: string[]) => {
                setId(id);
            },
            ids: id,
        }));

        return (
            <Modal isOpen={isOpen} onClose={onClose} size={'3xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select {type}</ModalHeader>
                    <ModalCloseButton />
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
                                    {type === 'Attachments' ? (
                                        <Box>
                                            <Text>Attachment</Text>
                                        </Box>
                                    ) : (
                                        list.map((item, index) => (
                                            <Tr key={item.id}>
                                                <Td>
                                                    <Checkbox
                                                        isChecked={id.includes(
                                                            item.id
                                                        )}
                                                        mr={4}
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setId([
                                                                    ...id,
                                                                    item.id,
                                                                ]);
                                                            } else {
                                                                setId(
                                                                    id.filter(
                                                                        (i) =>
                                                                            i !==
                                                                            item.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    {index + 1}
                                                </Td>
                                                <Td>{item.first_name}</Td>
                                                <Td>{item.last_name}</Td>
                                                <Td>
                                                    {`${item.contact_details_phone?.country_code}${item.contact_details_phone?.number}`}
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={() => {
                                setId([]);
                            }}
                        >
                            Deselect All
                        </Button>
                        <Button colorScheme="green" onClick={handleAdd}>
                            Select
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }
);

export default SelectContactsList;
