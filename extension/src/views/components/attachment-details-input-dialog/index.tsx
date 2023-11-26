import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Input,
    Tag,
    TagLabel,
    Text,
} from '@chakra-ui/react';
import React from 'react';

const AttachmentDetailsInputDialog = ({
    isOpen,
    onConfirm,
    onClose,
    variables,
}: {
    onClose: () => void;
    onConfirm: (name: string, caption: string) => void;
    isOpen: boolean;
    variables?: string[];
}) => {
    const [name, setName] = React.useState('');
    const [caption, setCaption] = React.useState('');
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
                <AlertDialogHeader pb={0} fontSize={'sm'}>
                    Assign a name, caption & message.
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Flex direction={'column'} gap={2}>
                        <Input
                            width={'full'}
                            placeholder={'attachment name....'}
                            border={'none'}
                            className="text-black !bg-[#ECECEC] "
                            _placeholder={{ opacity: 0.4, color: 'inherit' }}
                            _focus={{ border: 'none', outline: 'none' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            width={'full'}
                            placeholder={'caption (optional)'}
                            border={'none'}
                            className="text-black !bg-[#ECECEC] "
                            _placeholder={{ opacity: 0.4, color: 'inherit' }}
                            _focus={{ border: 'none', outline: 'none' }}
                            value={caption ?? ''}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <Box hidden={variables === undefined}>
                            <Text
                                fontSize="xs"
                                className="text-gray-700 dark:text-gray-400"
                                hidden={variables?.length === 0}
                            >
                                Variables
                            </Text>
                            <Box>
                                {variables
                                    ? variables.map((variable, index) => (
                                          <Tag
                                              size={'sm'}
                                              m={'0.25rem'}
                                              p={'0.5rem'}
                                              key={index}
                                              borderRadius="md"
                                              variant="solid"
                                              colorScheme="gray"
                                              _hover={{ cursor: 'pointer' }}
                                              onClick={() => {
                                                  setCaption(
                                                      caption + variable
                                                  );
                                              }}
                                          >
                                              <TagLabel>{variable}</TagLabel>
                                          </Tag>
                                      ))
                                    : null}
                            </Box>
                        </Box>
                    </Flex>
                </AlertDialogBody>
                <AlertDialogFooter pt={0}>
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
                        onClick={() => onConfirm(name, caption)}
                        ml={3}
                        size={'sm'}
                    >
                        Save
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AttachmentDetailsInputDialog;
