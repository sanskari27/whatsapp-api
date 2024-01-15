import { DeleteIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../../hooks/useTheme';
import ContactCardService from '../../../../services/contact-card.service';
import { StoreNames, StoreState } from '../../../../store';
import {
    addContactCard,
    addContactNumberOther,
    addLink,
    clearContactCard,
    removeContactNumberOther,
    removeLink,
    savingContactCard,
    setCity,
    setContactNumberOther,
    setContactNumberPhone,
    setContactNumberWork,
    setCountry,
    setEmailPersonal,
    setEmailWork,
    setError,
    setFirstName,
    setLastName,
    setLinks,
    setMiddleName,
    setOrganization,
    setPincode,
    setState,
    setStreet,
    setTitle,
    updateContactCard,
} from '../../../../store/reducers/ContactCardReducers';
import CountryCodeInput from '../../../components/country-code-input';

export type ContactInputDialogHandle = {
    open: () => void;
    close: () => void;
};

const ContactInputDialog = forwardRef<ContactInputDialogHandle>((_, ref) => {
    const dispatch = useDispatch();
    const theme = useTheme();

    const { isOpen, onOpen, onClose } = useDisclosure();

    useImperativeHandle(ref, () => ({
        open: () => {
            onOpen();
        },
        close: () => {
            onClose();
        },
    }));

    const { selectedCard, uiDetails } = useSelector(
        (state: StoreState) => state[StoreNames.CONTACT_CARD]
    );
    const {
        first_name,
        last_name,
        middle_name,
        title,
        organization,
        city,
        country,
        email_personal,
        email_work,
        pincode,
        state,
        street,
        contact_details_other,
        contact_details_phone,
        contact_details_work,
        links,
    } = selectedCard;

    const { error, isUpdating, isSaving } = uiDetails;

    const handleClose = () => {
        dispatch(clearContactCard());
        onClose();
    };

    const handleClearContactCard = () => {
        dispatch(clearContactCard());
    };

    const handleSave = () => {
        dispatch(setError(''));
        dispatch(savingContactCard());
        const details = {
            contact_details_phone: '',
            contact_details_work: '',
            contact_details_other: [] as string[],
        };
        if (contact_details_phone?.number) {
            details.contact_details_phone = `${contact_details_phone.country_code}${contact_details_phone.number}`;
        }
        if (contact_details_work?.number) {
            details.contact_details_work = `${contact_details_work.country_code}${contact_details_work.number}`;
        }
        if (contact_details_other?.length) {
            details.contact_details_other = contact_details_other.map(
                (number) => `${number.country_code}${number.number}`
            );
        }

        if (isUpdating) {
            ContactCardService.UpdateContactCard({
                ...selectedCard,
                ...details,
            }).then((res) => {
                if (!res) {
                    dispatch(setError('Something went wrong'));
                    return;
                }
                dispatch(updateContactCard(res));
                handleClose();
            });
        } else {
            ContactCardService.CreateContactCard({
                ...selectedCard,
                ...details,
            }).then((res) => {
                if (!res) {
                    dispatch(setError('Something went wrong'));
                    return;
                }
                dispatch(addContactCard(res));
                handleClose();
            });
        }
    };

    const updateContactNumber = (
        type: 'PHONE' | 'WORK' | 'OTHER',
        key: 'country_code' | 'number',
        value: string | undefined,
        index?: number
    ) => {
        if (type === 'PHONE') {
            dispatch(
                setContactNumberPhone({
                    ...contact_details_phone,
                    [key]: value,
                } as { country_code: string; number: string })
            );
        }
        if (type === 'WORK') {
            dispatch(
                setContactNumberWork({
                    ...contact_details_work,
                    [key]: value,
                } as { country_code: string; number: string })
            );
        }
        if (type === 'OTHER') {
            if (index === undefined) return;
            dispatch(
                setContactNumberOther({
                    index,
                    ...contact_details_other?.[index],
                    [key]: value,
                } as { index: number; country_code: string; number: string })
            );
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size={'lg'}
            onCloseComplete={handleClose}
        >
            <DrawerOverlay />
            <DrawerContent
                textColor={theme === 'dark' ? 'white' : 'black'}
                backgroundColor={theme === 'dark' ? '#252525' : 'white'}
            >
                <DrawerCloseButton onClick={handleClearContactCard} />
                <DrawerHeader>
                    {isUpdating ? 'Update' : 'Create'} Contact
                </DrawerHeader>

                <DrawerBody>
                    <VStack width={'full'} alignItems={'stretch'} gap={4}>
                        <Box>
                            <Text>First name</Text>
                            <Input
                                placeholder="First name"
                                type="text"
                                onChange={(e) =>
                                    dispatch(setFirstName(e.target.value))
                                }
                                value={first_name ?? ''}
                            />
                        </Box>
                        <HStack>
                            <Box width={'full'}>
                                <Text>Middle name</Text>
                                <Input
                                    placeholder="Middle name"
                                    type="text"
                                    value={middle_name ?? ''}
                                    onChange={(e) =>
                                        dispatch(setMiddleName(e.target.value))
                                    }
                                />
                            </Box>
                            <Box width={'full'}>
                                <Text>Last name</Text>
                                <Input
                                    placeholder="Last name"
                                    type="text"
                                    value={last_name ?? ''}
                                    onChange={(e) =>
                                        dispatch(setLastName(e.target.value))
                                    }
                                />
                            </Box>
                        </HStack>
                        <Text>Job Description</Text>
                        <HStack>
                            <Box width={'full'}>
                                <Text>Title</Text>
                                <Input
                                    placeholder="Title"
                                    type="text"
                                    value={title ?? ''}
                                    onChange={(e) =>
                                        dispatch(setTitle(e.target.value))
                                    }
                                />
                            </Box>
                            <Box width={'full'}>
                                <Text>Organization</Text>
                                <Input
                                    placeholder="Organization"
                                    type="text"
                                    value={organization ?? ''}
                                    onChange={(e) =>
                                        dispatch(
                                            setOrganization(e.target.value)
                                        )
                                    }
                                />
                            </Box>
                        </HStack>
                        <Box>
                            <Text>Personal Email</Text>
                            <Input
                                placeholder="Personal Email"
                                type="email"
                                value={email_personal ?? ''}
                                onChange={(e) =>
                                    dispatch(setEmailPersonal(e.target.value))
                                }
                            />
                        </Box>
                        <Box>
                            <Text>Work Email</Text>
                            <Input
                                placeholder="Work Email"
                                type="email"
                                value={email_work ?? ''}
                                onChange={(e) =>
                                    dispatch(setEmailWork(e.target.value))
                                }
                            />
                        </Box>
                        <Box>
                            <Text>Primary Phone Number</Text>
                            <InputGroup
                                bgColor={'transparent'}
                                borderWidth={'1px'}
                                rounded={'md'}
                            >
                                <InputLeftAddon
                                    border={'none'}
                                    outline={'none'}
                                    bgColor={'transparent'}
                                    p={0}
                                    children={
                                        <CountryCodeInput
                                            value={
                                                contact_details_phone?.country_code ??
                                                ''
                                            }
                                            onChange={(text) => {
                                                updateContactNumber(
                                                    'PHONE',
                                                    'country_code',
                                                    text
                                                );
                                            }}
                                        />
                                    }
                                />
                                <Input
                                    type="tel"
                                    placeholder="eg. 89XXXXXX43"
                                    width={'full'}
                                    rounded={'md'}
                                    border={'none'}
                                    _focus={{ border: 'none', outline: 'none' }}
                                    value={contact_details_phone?.number ?? ''}
                                    name="number"
                                    onChange={(e) => {
                                        updateContactNumber(
                                            'PHONE',
                                            'number',
                                            e.target.value
                                        );
                                    }}
                                />
                            </InputGroup>
                        </Box>
                        <Box>
                            <Text>Work Phone Number</Text>
                            <InputGroup
                                bgColor={'transparent'}
                                borderWidth={'1px'}
                                rounded={'md'}
                            >
                                <InputLeftAddon
                                    border={'none'}
                                    outline={'none'}
                                    bgColor={'transparent'}
                                    p={0}
                                    children={
                                        <CountryCodeInput
                                            value={
                                                contact_details_work?.country_code ??
                                                ''
                                            }
                                            onChange={(text) => {
                                                updateContactNumber(
                                                    'WORK',
                                                    'country_code',
                                                    text
                                                );
                                            }}
                                        />
                                    }
                                />
                                <Input
                                    type="tel"
                                    placeholder="eg. 89XXXXXX43"
                                    width={'full'}
                                    rounded={'md'}
                                    border={'none'}
                                    _focus={{ border: 'none', outline: 'none' }}
                                    value={contact_details_work?.number ?? ''}
                                    name="number"
                                    onChange={(e) => {
                                        updateContactNumber(
                                            'WORK',
                                            'number',
                                            e.target.value
                                        );
                                    }}
                                />
                            </InputGroup>
                        </Box>
                        <Box>
                            <HStack
                                justifyContent={'space-between'}
                                width={'full'}
                                pb={'1rem'}
                            >
                                <Text>Other Phone Number</Text>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    variant={'outline'}
                                    onClick={() =>
                                        dispatch(
                                            addContactNumberOther({
                                                country_code: '91',
                                                number: '',
                                            })
                                        )
                                    }
                                >
                                    Add Number
                                </Button>
                            </HStack>
                            {contact_details_other?.map((number, index) => {
                                return (
                                    <HStack pb={4} key={index}>
                                        <InputGroup
                                            bgColor={'transparent'}
                                            borderWidth={'1px'}
                                            rounded={'md'}
                                        >
                                            <InputLeftAddon
                                                border={'none'}
                                                outline={'none'}
                                                bgColor={'transparent'}
                                                p={0}
                                                children={
                                                    <CountryCodeInput
                                                        value={
                                                            number.country_code
                                                        }
                                                        onChange={(text) => {
                                                            updateContactNumber(
                                                                'OTHER',
                                                                'country_code',
                                                                text,
                                                                index
                                                            );
                                                        }}
                                                    />
                                                }
                                            />
                                            <Input
                                                type="tel"
                                                placeholder="eg. 89XXXXXX43"
                                                width={'full'}
                                                rounded={'md'}
                                                border={'none'}
                                                _focus={{
                                                    border: 'none',
                                                    outline: 'none',
                                                }}
                                                value={number.number ?? ''}
                                                name="number"
                                                onChange={(e) => {
                                                    updateContactNumber(
                                                        'OTHER',
                                                        'number',
                                                        e.target.value,
                                                        index
                                                    );
                                                }}
                                            />
                                        </InputGroup>

                                        <IconButton
                                            aria-label="add phone number"
                                            icon={
                                                <DeleteIcon color={'white'} />
                                            }
                                            backgroundColor={'red.400'}
                                            _hover={{
                                                backgroundColor: 'red.500',
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            border={'none'}
                                            outline={'none'}
                                            onClick={() => {
                                                dispatch(
                                                    removeContactNumberOther(
                                                        index
                                                    )
                                                );
                                            }}
                                        />
                                    </HStack>
                                );
                            })}
                        </Box>
                        <Box>
                            <HStack
                                justifyContent={'space-between'}
                                width={'full'}
                                pb={'1rem'}
                            >
                                <Text>Websites and Social Media links</Text>
                                <Button
                                    size={'sm'}
                                    colorScheme="green"
                                    variant={'outline'}
                                    onClick={() => {
                                        dispatch(addLink(''));
                                    }}
                                >
                                    Add Websites
                                </Button>
                            </HStack>
                            {links?.map((link, index) => {
                                return (
                                    <HStack pb={4} key={index}>
                                        <Input
                                            placeholder="eg. google.com"
                                            type="url"
                                            value={link ?? ''}
                                            onChange={(e) => {
                                                dispatch(
                                                    setLinks({
                                                        index,
                                                        url: e.target.value,
                                                    })
                                                );
                                            }}
                                        />
                                        <IconButton
                                            aria-label="add website"
                                            icon={
                                                <DeleteIcon color={'white'} />
                                            }
                                            backgroundColor={'red.400'}
                                            _hover={{
                                                backgroundColor: 'red.500',
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            border={'none'}
                                            outline={'none'}
                                            onClick={() =>
                                                dispatch(removeLink(index))
                                            }
                                        />
                                    </HStack>
                                );
                            })}
                        </Box>
                        <Text>Address</Text>

                        <Box>
                            <Text>Street</Text>
                            <Input
                                placeholder="street"
                                type="text"
                                value={street ?? ''}
                                onChange={(e) =>
                                    dispatch(setStreet(e.target.value))
                                }
                            />
                        </Box>
                        <HStack>
                            <Box width={'full'}>
                                <Text>City</Text>
                                <Input
                                    placeholder="city"
                                    type="text"
                                    value={city ?? ''}
                                    onChange={(e) =>
                                        dispatch(setCity(e.target.value))
                                    }
                                />
                            </Box>
                            <Box width={'full'}>
                                <Text>State</Text>
                                <Input
                                    placeholder="state"
                                    type="text"
                                    value={state ?? ''}
                                    onChange={(e) =>
                                        dispatch(setState(e.target.value))
                                    }
                                />
                            </Box>
                        </HStack>
                        <HStack>
                            <Box width={'full'}>
                                <Text>Country</Text>
                                <Input
                                    placeholder="country"
                                    type="text"
                                    value={country ?? ''}
                                    onChange={(e) =>
                                        dispatch(setCountry(e.target.value))
                                    }
                                />
                            </Box>
                            <Box width={'full'}>
                                <Text>Pincode</Text>
                                <Input
                                    placeholder="pincode"
                                    type="text"
                                    value={pincode ?? ''}
                                    onChange={(e) =>
                                        dispatch(setPincode(e.target.value))
                                    }
                                />
                            </Box>
                        </HStack>
                    </VStack>
                </DrawerBody>

                <DrawerFooter width={'full'} justifyContent={'space-between'}>
                    <Text textColor="tomato">{error ? error : ''}</Text>
                    <HStack>
                        <Button
                            variant="outline"
                            colorScheme="red"
                            mr={3}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            isLoading={isSaving}
                            colorScheme="green"
                            onClick={handleSave}
                        >
                            {isUpdating ? 'Edit' : 'Save'}
                        </Button>
                    </HStack>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
});

export default ContactInputDialog;
