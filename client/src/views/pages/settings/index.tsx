import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import PaymentService from '../../../services/payment.service';
import { StoreNames, StoreState } from '../../../store';

type SettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Settings({ isOpen, onClose }: SettingsProps) {
    const theme = useTheme();

    const {
        name,
        isSubscribed,
        phoneNumber,
        subscriptionExpiration,
        userType,
    } = useSelector((state: StoreState) => state[StoreNames.USER]);

    const [PAYMENT_RECORDS, setPaymentRecords] = useState<
        (
            | {
                  type: 'payment';
                  id: string;
                  date: string;
                  amount: number;
              }
            | {
                  type: 'subscription';
                  id: string;
                  plan: string;
                  isActive: boolean;
                  isPaused: boolean;
              }
        )[]
    >([]);

    useEffect(() => {
        PaymentService.paymentRecords().then(setPaymentRecords);
    }, []);

    return (
        <Drawer
            placement={'left'}
            onClose={onClose}
            isOpen={isOpen}
            size={'lg'}
        >
            <DrawerOverlay />
            <DrawerContent
                backgroundColor={theme === 'dark' ? '#252525' : 'white'}
            >
                <DrawerCloseButton
                    color={theme === 'dark' ? 'white' : 'black'}
                />
                <DrawerHeader
                    borderBottomWidth="1px"
                    textColor={theme === 'dark' ? 'white' : 'black'}
                >
                    Settings
                </DrawerHeader>
                <DrawerBody>
                    <Box width="full" py={'1rem'} px={'1rem'}>
                        <Box marginTop={'1rem'}>
                            <section>
                                <Flex
                                    justifyContent={'space-between'}
                                    alignItems={'center'}
                                >
                                    <Text
                                        className="text-black dark:text-white"
                                        fontSize={'md'}
                                        fontWeight={'medium'}
                                    >
                                        {name}
                                    </Text>
                                    <Text className="text-gray-800 dark:text-gray-300">
                                        {userType}
                                    </Text>
                                </Flex>
                                <Box
                                    marginTop={'0.25rem'}
                                    className="bg-[#C6E3FF] dark:bg-[#234768]"
                                    paddingX={'1rem'}
                                    paddingY={'0.5rem'}
                                    width={'max-content'}
                                    rounded={'md'}
                                >
                                    <Text className="text-[#158FFF] dark:text-[#158FFF]">
                                        {phoneNumber ? `+${phoneNumber}` : ''}
                                    </Text>
                                </Box>
                            </section>

                            <section>
                                <Flex
                                    marginTop={'1rem'}
                                    rounded={'md'}
                                    alignItems={'center'}
                                >
                                    <Text
                                        color="gray.400"
                                        fontWeight={'semibold'}
                                    >
                                        Plan
                                    </Text>
                                    <Box
                                        bgColor={'gray.400'}
                                        width={'full'}
                                        height={'2px'}
                                        marginLeft={'1rem'}
                                    />
                                </Flex>

                                <Box
                                    marginTop={'0.25rem'}
                                    className={`${
                                        isSubscribed
                                            ? 'dark:bg-[#235C39] bg-[#B4FED0]'
                                            : 'dark:bg-[#541919] bg-[#FFC9C9]'
                                    }`}
                                    paddingX={'1rem'}
                                    paddingY={'0.5rem'}
                                    width={'max-content'}
                                    rounded={'md'}
                                >
                                    <Text
                                        textColor={
                                            isSubscribed ? '#34F27B' : '#FF2626'
                                        }
                                    >
                                        {isSubscribed
                                            ? 'Active'
                                            : 'Not Subscribed'}
                                    </Text>
                                </Box>
                                {isSubscribed ? (
                                    <Flex
                                        marginTop={'0.5rem'}
                                        gap={'0.5rem'}
                                        alignItems={'center'}
                                    >
                                        <InfoOutlineIcon
                                            color={'#BB2525'}
                                            width={4}
                                        />
                                        <Text color={'#BB2525'}>
                                            Expires On {subscriptionExpiration}
                                        </Text>
                                    </Flex>
                                ) : null}
                            </section>

                            <section>
                                <Flex
                                    marginTop={'1rem'}
                                    rounded={'md'}
                                    alignItems={'center'}
                                    hidden={PAYMENT_RECORDS.length === 0}
                                >
                                    <Text
                                        color="gray.400"
                                        fontWeight={'semibold'}
                                    >
                                        Payment History
                                    </Text>
                                    <Box
                                        bgColor={'gray.400'}
                                        flexGrow={'1'}
                                        height={'2px'}
                                        marginLeft={'1rem'}
                                    />
                                </Flex>

                                <VStack
                                    marginTop={'0.25rem'}
                                    paddingX={'1rem'}
                                    paddingY={'0.5rem'}
                                    alignItems={'center'}
                                    rounded={'md'}
                                    flexDirection={'column'}
                                    hidden={PAYMENT_RECORDS.length === 0}
                                >
                                    <HStack
                                        justifyContent={'end'}
                                        width={'full'}
                                    >
                                        <Button
                                            variant="solid"
                                            backgroundColor={'green.500'}
                                            color={'white'}
                                            onClick={() =>
                                                PaymentService.paymentRecords({
                                                    csv: true,
                                                })
                                            }
                                            _hover={{
                                                backgroundColor: 'green.600',
                                            }}
                                        >
                                            Export
                                        </Button>
                                        <Button
                                            variant="solid"
                                            backgroundColor={'blue.500'}
                                            color={'white'}
                                            _hover={{
                                                backgroundColor: 'blue.600',
                                            }}
                                        >
                                            Download Invoice
                                        </Button>
                                    </HStack>
                                    <TableContainer
                                        border={'1px'}
                                        borderColor={'gray.100'}
                                        rounded={'lg'}
                                        padding={'0.5rem'}
                                        marginTop={'0.5rem'}
                                        width={'full'}
                                    >
                                        <Table
                                            size={'sm'}
                                            className="text-gray-800 dark:text-gray-300"
                                        >
                                            <Thead className="text-gray-900 dark:text-gray-100">
                                                <Tr>
                                                    <Th>Date</Th>
                                                    <Th isNumeric>Amount</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {PAYMENT_RECORDS.map(
                                                    (record, index) => {
                                                        if (
                                                            record.type ===
                                                            'subscription'
                                                        )
                                                            return (
                                                                <Tr key={index}>
                                                                    <Td>
                                                                        Subscription
                                                                        -{' '}
                                                                        {
                                                                            record.plan
                                                                        }
                                                                    </Td>
                                                                    <Td
                                                                        isNumeric
                                                                    >
                                                                        {record.isActive
                                                                            ? 'active'
                                                                            : record.isPaused
                                                                            ? 'paused'
                                                                            : 'on-hold'}
                                                                    </Td>
                                                                </Tr>
                                                            );
                                                        else
                                                            return (
                                                                <Tr key={index}>
                                                                    <Td>
                                                                        {
                                                                            record.date
                                                                        }
                                                                    </Td>
                                                                    <Td
                                                                        isNumeric
                                                                    >
                                                                        {
                                                                            record.amount
                                                                        }
                                                                    </Td>
                                                                </Tr>
                                                            );
                                                    }
                                                )}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </VStack>
                            </section>
                        </Box>
                    </Box>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}
