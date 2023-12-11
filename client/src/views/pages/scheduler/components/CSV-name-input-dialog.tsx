import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Input,
} from '@chakra-ui/react';
import React from 'react';

const CSVNameInputDialog = ({
    isOpen,
    onConfirm,
    onClose,
    handleTextChange,
}: {
    onClose: () => void;
    onConfirm: () => void;
    handleTextChange: (text: string) => void;
    isOpen: boolean;
}) => {
    const cancelRef = React.useRef<any>();
    return (
        <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />

            <AlertDialogContent width={'80%'}>
                <AlertDialogHeader fontSize={'sm'}>
                    Assign a name to the CSV file.
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Input
                        width={'full'}
                        placeholder={'ex. fanfest audience list'}
                        border={'none'}
                        className="text-black !bg-[#ECECEC] "
                        _placeholder={{ opacity: 0.4, color: 'inherit' }}
                        _focus={{ border: 'none', outline: 'none' }}
                        onChange={(e) => handleTextChange(e.target.value)}
                    />
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button
                        ref={cancelRef}
                        colorScheme="red"
                        onClick={onClose}
                        size={'sm'}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={onConfirm}
                        ml={3}
                        size={'sm'}
                    >
                        Upload
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CSVNameInputDialog;
