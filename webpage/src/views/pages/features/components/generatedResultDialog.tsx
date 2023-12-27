import { CopyIcon } from '@chakra-ui/icons';
import {
    Button,
    Image,
    Input,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalOverlay,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdDoneOutline, MdDownload } from 'react-icons/md';

type GeneratedResultDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    image: string;
    link: string;
};

const GeneratedResultDialog = ({
    isOpen,
    onClose,
    image,
    link,
}: GeneratedResultDialogProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    }, [copied]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalBody>
                    <VStack>
                        <Image src={image} className="w-3/4" />
                        <Button
                            width={'full'}
                            colorScheme="green"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = image;
                                link.download = 'qr.png';
                                link.click();
                            }}
                            leftIcon={<MdDownload />}
                        >
                            Download QR
                        </Button>
                        <Text alignSelf={'start'} pt={4}>
                            Shorten URL
                        </Text>
                        <InputGroup>
                            <Input value={link} isReadOnly />
                            <InputRightAddon
                                p={0}
                                children={
                                    <Button
                                        leftIcon={
                                            copied ? (
                                                <MdDoneOutline />
                                            ) : (
                                                <CopyIcon />
                                            )
                                        }
                                        colorScheme="green"
                                        onClick={() => {
                                            setCopied(true);
                                            window.navigator.clipboard.writeText(
                                                link
                                            );
                                        }}
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                }
                            />
                        </InputGroup>
                    </VStack>
                </ModalBody>

                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>
    );
};
export default GeneratedResultDialog;
