import React, { forwardRef, useImperativeHandle, useState } from 'react';

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Input,
    Text,
} from '@chakra-ui/react';
import { useTheme } from '../../../../hooks/useTheme';

export type EditLinkDialogHandle = {
    open: () => void;
    close: () => void;
    setLink: (id: { id: string; link: string; shortLink: string }) => void;
};

type Props = {
    onConfirm: (id: string, newLink: string) => void;
};

const EditLinkDialog = forwardRef<EditLinkDialogHandle, Props>(
    ({ onConfirm }: Props, ref) => {
        const theme = useTheme();
        const [isOpen, setOpen] = useState(false);
        const [newLink, setNewLink] = useState('' as string);
        const [link, setLink] = useState({
            id: '',
            link: '',
            shorten_link: '',
        } as {
            id: string;
            link: string;
            shorten_link: string;
        });
        const close = () => {
            setOpen(false);
        };

        const cancelRef = React.useRef() as React.RefObject<HTMLButtonElement>;

        useImperativeHandle(ref, () => ({
            open: () => {
                setOpen(true);
                setNewLink('');
            },
            close: () => {
                setOpen(false);
            },
            setLink: (id: { id: string; link: string; shortLink: string }) => {
                setLink({
                    id: id.id,
                    link: id.link,
                    shorten_link: id.shortLink,
                });
            },
        }));

        const handleEdit = () => {
            if (newLink === '') return;
            onConfirm(link.id, newLink);
            setOpen(false);
        };

        return (
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={close}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent
                        backgroundColor={theme === 'dark' ? '#252525' : 'white'}
                        textColor={theme === 'dark' ? 'white' : 'black'}
                    >
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Change Link
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Box pb={4}>
                                <Text>Current Link</Text>
                                <Input value={link.link} isReadOnly mt={2} />
                            </Box>
                            <Box pb={4}>
                                <Text>Shorten Link</Text>
                                <Input
                                    value={link.shorten_link}
                                    isReadOnly
                                    mt={2}
                                />
                            </Box>
                            <Box>
                                <Text>New Link</Text>
                                <Input
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    mt={2}
                                />
                            </Box>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={close}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="yellow"
                                onClick={handleEdit}
                                ml={3}
                            >
                                Edit
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        );
    }
);

export default EditLinkDialog;
