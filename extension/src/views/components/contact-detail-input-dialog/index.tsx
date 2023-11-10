import {
    Box,
    Button,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";

const ContactDetailInputDialog = ({
    isOpen,
    onConfirm,
    onClose,
}: {
    onClose: () => void;
    onConfirm: (contact: {
        first_name?: string;
        last_name?: string;
        title?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        link?: string;
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => void;
    isOpen: boolean;
}) => {
    const [contact, setContact] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        organization: "",
        email_personal: "",
        email_work: "",
        contact_number_phone: "",
        contact_number_work: "",
        link: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
    });

    const handleDialogClose = () => {
        setContact({
            first_name: "",
            middle_name: "",
            last_name: "",
            organization: "",
            email_personal: "",
            email_work: "",
            contact_number_phone: "",
            contact_number_work: "",
            link: "",
            street: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
        });
        onClose();
    };

    return (
        <Modal
            size={"xs"}
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            colorScheme="dark"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Contact</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        <Text>First Name</Text>
                        <Input
                            width={"full"}
                            placeholder="e.g. John"
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.first_name}
                            name="contact.first_name"
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    first_name: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <HStack>
                        <Box>
                            <Text>Middle Name</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.middle_name}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        middle_name: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text>Last Name</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.last_name}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        last_name: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                    <Box>
                        <Text>URL</Text>
                        <Input
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.organization}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    organization: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <HStack>
                        <Box>
                            <Text>Personal Email</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.email_personal ?? ""}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        email_personal: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text>Work Email</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.email_work}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        email_work: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                    <Box>
                        <Text>Phone Number</Text>
                        <Input
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.contact_number_phone}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    contact_number_phone: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <Box>
                        <Text>Work Number</Text>
                        <Input
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.contact_number_work}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    contact_number_work: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <Box>
                        <Text>Street</Text>
                        <Input
                            width={"full"}
                            size={"sm"}
                            rounded={"md"}
                            border={"none"}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _focus={{ border: "none", outline: "none" }}
                            value={contact.street}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    street: e.target.value,
                                });
                            }}
                        />
                    </Box>
                    <HStack>
                        <Box>
                            <Text>City</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.city}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        city: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text>State</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.state}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        state: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                    <HStack>
                        <Box>
                            <Text>Country</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.country}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        country: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                        <Box>
                            <Text>Pincode</Text>
                            <Input
                                width={"full"}
                                size={"sm"}
                                rounded={"md"}
                                border={"none"}
                                className="text-black dark:text-white !bg-[#ECECEC] dark:!bg-[#535353]"
                                _focus={{ border: "none", outline: "none" }}
                                value={contact.pincode}
                                onChange={(e) => {
                                    setContact({
                                        ...contact,
                                        pincode: e.target.value,
                                    });
                                }}
                            />
                        </Box>
                    </HStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        mr={3}
                        onClick={handleDialogClose}
                    >
                        Close
                    </Button>
                    <Button variant="ghost" onClick={() => onConfirm(contact)}>
                        Add Contact
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ContactDetailInputDialog;
