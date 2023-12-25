import { LinkIcon } from '@chakra-ui/icons';
import {
    Button,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
// import TextToQR from '../../../helpers/qr-generator/textToQR';
import ShortenerService from '../../../services/shortener.service';
import GeneratedResultDialog from './components/generatedResultDialog';

const LinkShortner = () => {
    const [uiDetails, setUiDetails] = useState({
        number: '',
        message: '',
        text: '',
        generatingLink: false,
        shorteningLink: false,
        linkCopied: false,
    });

    const [generatedResult, setGeneratedResult] = useState({
        generatedLink: '',
        generatedImage: '',
    });

    const [error, setError] = useState({
        number: '',
        message: '',
        link: '',
        apiError: '',
    });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setError({
            number: '',
            message: '',
            link: '',
            apiError: '',
        });
        setUiDetails((prev) => ({ ...prev, linkCopied: false }));
        const { name, value } = e.target;
        setUiDetails((prev) => ({ ...prev, [name]: value }));
    };

    const generateQrCode = async () => {
        if (uiDetails.number === '') {
            setError((prev) => ({
                ...prev,
                number: 'Please enter a valid number',
            }));
            return;
        }
        if (uiDetails.message === '') {
            setError((prev) => ({
                ...prev,
                message: 'Please enter a valid message',
            }));
            return;
        }
        setUiDetails((prev) => ({ ...prev, generatingLink: true }));
        ShortenerService.getShortenedURL(
            uiDetails.number,
            uiDetails.message
        ).then((res) => {
            setUiDetails((prev) => ({ ...prev, generatingLink: false }));
            if (!res) {
                setError((prev) => ({
                    ...prev,
                    apiError: 'Something went wrong',
                }));
                return;
            }
            onOpen();
            setGeneratedResult((prev) => ({
                ...prev,
                generatedLink: res.link,
                generatedImage: res.base64,
            }));
        });
    };

    const generateLinkToQR = async () => {
        if (uiDetails.text === '') {
            setError((prev) => ({
                ...prev,
                link: 'Please enter a valid link',
            }));
            return;
        }
        setUiDetails((prev) => ({ ...prev, shorteningLink: true }));

        const data = await ShortenerService.createLink(uiDetails.text);

        setUiDetails((prev) => ({ ...prev, shorteningLink: false }));

        if (!data) {
            setError((prev) => ({
                ...prev,
                apiError: 'Something went wrong',
            }));
            return;
        }

        setGeneratedResult({
            generatedLink: data.link,
            generatedImage: data.image,
        });

        onOpen();
    };

    useEffect(() => {
        setTimeout(() => {
            setUiDetails((prev) => ({ ...prev, linkCopied: false }));
        }, 5000);
    }, [uiDetails.linkCopied]);

    return (
        <HStack py={4}>
            <Flex
                mt={'2rem'}
                direction={'column'}
                alignSelf={'center'}
                gap={4}
                p={4}
            >
                <FormControl isInvalid={!!error.number}>
                    <FormLabel>What's your number?</FormLabel>
                    <Input
                        placeholder="eg. 91"
                        type="number"
                        name="number"
                        onChange={handleChange}
                        value={uiDetails.number}
                    />
                    <FormHelperText fontSize={'xs'}>
                        Make sure you include the country code followed by the
                        area code eg. for india 91, for UK 44
                    </FormHelperText>
                    <FormErrorMessage>{error.number}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!error.message}>
                    <FormLabel>
                        What message do you want your customer to see when they
                        contact you?
                    </FormLabel>
                    <Textarea
                        resize={'none'}
                        name="message"
                        onChange={handleChange}
                        value={uiDetails.message}
                        placeholder="Enter your message"
                    />
                    <FormErrorMessage>{error.message}</FormErrorMessage>
                </FormControl>
                <Button
                    width={'full'}
                    leftIcon={<LinkIcon />}
                    colorScheme="whatsapp"
                    onClick={generateQrCode}
                    isLoading={uiDetails.generatingLink}
                >
                    Create Link
                </Button>

                {error.apiError !== '' && (
                    <Text color={'tomato'}>{error.apiError}</Text>
                )}

                <HStack>
                    <Divider />
                    <Text>or</Text>
                    <Divider />
                </HStack>
                <FormControl isInvalid={!!error.link}>
                    <FormLabel>Enter Link to Shorten</FormLabel>
                    <Input
                        placeholder="Enter Link"
                        name="text"
                        onChange={handleChange}
                        value={uiDetails.text}
                        type="url"
                    />
                    <FormErrorMessage>{error.link}</FormErrorMessage>
                </FormControl>
                <Button
                    isLoading={uiDetails.shorteningLink}
                    width={'full'}
                    leftIcon={<LinkIcon />}
                    colorScheme="whatsapp"
                    onClick={generateLinkToQR}
                >
                    Shorten Link
                </Button>
            </Flex>
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>link</Th>
                            <Th>shorten link</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>dsfuhklsdahfas</Td>
                            <Td>sdfasdfasf</Td>
                            <Td>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    onClick={() => {
                                        // ReportsService.resumeCampaign(
                                        //     campaign.campaign_id
                                        // ).then(() => {
                                        //     fetchCampaigns();
                                        // });
                                    }}
                                >
                                    Resume
                                </Button>
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
            <GeneratedResultDialog
                isOpen={isOpen}
                onClose={onClose}
                image={generatedResult.generatedImage}
                link={generatedResult.generatedLink}
            />
        </HStack>
    );
};

export default LinkShortner;
