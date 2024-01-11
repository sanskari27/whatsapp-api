import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../store';

const SubscriptionAlert = () => {
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const { canSendMessage } = useSelector(
        (state: StoreState) => state[StoreNames.USER]
    );

    useEffect(() => {
        setIsOpen(!canSendMessage);
    }, [canSendMessage]);

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Subscription Alert
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Please Subscribe to use this feature
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            ref={cancelRef}
                            onClick={onClose}
                            colorScheme="gray"
                            className="focus:outline-none focus:border-none active:outline-none active:border-none"
                            outline={'none'}
                            border={'none'}
                        >
                            Close
                        </Button>
                        <Button
                            className="focus:outline-none focus:border-none active:outline-none active:border-none"
                            outline={'none'}
                            border={'none'}
                            colorScheme="yellow"
                            onClick={() => {
                                window.open(
                                    'https://whatsleads.in/pricing',
                                    '_black'
                                );
                                onClose();
                            }}
                            ml={3}
                            textColor={'white'}
                        >
                            Subscribe
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default SubscriptionAlert;
