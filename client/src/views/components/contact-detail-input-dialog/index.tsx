import {
    Button,
    Checkbox,
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

export type SelectContactOrAttachmentListHandle = {
    open: () => void;
    close: () => void;
    setContactId: (id: string[]) => void;
    setAttachmentId: (id: string[]) => void;
    setType: (type: 'Contacts' | 'Attachments') => void;
    contactId: string[];
    attachmentId: string[];
};

type Props = {
    onConfirm: () => void;
};

const SelectContactsOrAttachmentsList = forwardRef<
    SelectContactOrAttachmentListHandle,
    Props
>(({ onConfirm }: Props, ref) => {
    const [isOpen, setOpen] = useState(false);
    const [type, setType] = useState<'Contacts' | 'Attachments'>();
    const onClose = () => {
        setContactId([]);
        setOpen(false);
    };
    const [contactId, setContactId] = useState<string[]>([]);
    const [attachmentId, setAttachmentId] = useState<string[]>([]);

    const { list } = useSelector(
        (state: StoreState) => state[StoreNames.CONTACT_CARD]
    );

    const { attachments } = useSelector(
        (state: StoreState) => state[StoreNames.ATTACHMENT]
    );

    const handleAdd = () => {
        setContactId([]);
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
        setContactId: (id: string[]) => {
            setContactId(id);
        },
        setAttachmentId: (id: string[]) => {
            setAttachmentId(id);
        },
        setType: (type: 'Contacts' | 'Attachments') => {
            setType(type);
        },
        contactId,
        attachmentId,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'3xl'}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Select {type}</ModalHeader>
                <ModalBody>
                    <TableContainer>
                        <Table>
                            <Thead>
                                {type === 'Attachments' ? (
                                    <Tr>
                                        <Th width={'10%'}>Sl no</Th>
                                        <Th width={'40%'}>Name</Th>
                                        <Th width={'40%'}>Caption</Th>
                                        <Th width={'10%'}>Custom Caption</Th>
                                    </Tr>
                                ) : (
                                    <Tr>
                                        <Th>Sl no</Th>
                                        <Th>First Name</Th>
                                        <Th>Last Name</Th>
                                        <Th>Phone</Th>
                                    </Tr>
                                )}
                            </Thead>
                            <Tbody>
                                {type === 'Attachments'
                                    ? attachments.map((item, index) => (
                                          <Tr key={item.id}>
                                              <Td>
                                                  <Checkbox
                                                      isChecked={attachmentId.includes(
                                                          item.id
                                                      )}
                                                      mr={4}
                                                      onChange={(e) => {
                                                          if (
                                                              e.target.checked
                                                          ) {
                                                              setAttachmentId([
                                                                  ...contactId,
                                                                  item.id,
                                                              ]);
                                                          } else {
                                                              setAttachmentId(
                                                                  contactId.filter(
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
                                              <Td>{item.name}</Td>
                                              <Td>{item.caption}</Td>
                                              <Td>
                                                  {item.custom_caption
                                                      ? 'Yes'
                                                      : 'No'}
                                              </Td>
                                          </Tr>
                                      ))
                                    : list.map((item, index) => (
                                          <Tr key={item.id}>
                                              <Td>
                                                  <Checkbox
                                                      isChecked={contactId.includes(
                                                          item.id
                                                      )}
                                                      mr={4}
                                                      onChange={(e) => {
                                                          if (
                                                              e.target.checked
                                                          ) {
                                                              setContactId([
                                                                  ...contactId,
                                                                  item.id,
                                                              ]);
                                                          } else {
                                                              setContactId(
                                                                  contactId.filter(
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
                                                  {`${item.contact_details_phone?.country_code} ${item.contact_details_phone?.number}`}
                                              </Td>
                                          </Tr>
                                      ))}
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
                            setContactId([]);
                            setAttachmentId([]);
                        }}
                    >
                        Deselect All
                    </Button>
                    <Button colorScheme="green" onClick={handleAdd}>
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

export default SelectContactsOrAttachmentsList;
