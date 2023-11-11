import { InfoOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAVIGATION, SETTINGS } from '../../../config/const';
import { logout, useAuth } from '../../../hooks/useAuth';
import AuthService from '../../../services/auth.service';
import ExportsService from '../../../services/exports.service';
import PaymentService from '../../../services/payment.service';
import { saveClientID } from '../../../utils/ChromeUtils';
import Header from '../../components/header';
import LoginModal, { LoginHandle } from '../../components/login';

export default function Settings() {
    const { isAuthenticated, isAuthenticating, qrCode, qrGenerated } =
        useAuth();
    const loginModelRef = useRef<LoginHandle>(null);
    const navigate = useNavigate();

    const [details, setDetails] = useState({
        [SETTINGS.NAME]: '',
        [SETTINGS.PHONE_NUMBER]: '',
        [SETTINGS.IS_SUBSCRIBED]: false,
        [SETTINGS.SUBSCRIPTION_EXPIRATION]: '',
        [SETTINGS.USER_TYPE]: '',
    });

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
        if (!isAuthenticated) return;
        AuthService.getUserDetails().then((res) => {
            setDetails({
                [SETTINGS.NAME]: res.name,
                [SETTINGS.PHONE_NUMBER]: res.phoneNumber,
                [SETTINGS.IS_SUBSCRIBED]: res.isSubscribed,
                [SETTINGS.SUBSCRIPTION_EXPIRATION]: res.subscriptionExpiration,
                [SETTINGS.USER_TYPE]: res.userType,
            });
        });
        PaymentService.paymentRecords().then(setPaymentRecords);
    }, [isAuthenticated]);

    const {
        NAME,
        PHONE_NUMBER,
        IS_SUBSCRIBED,
        SUBSCRIPTION_EXPIRATION,
        USER_TYPE,
    } = details;

    useEffect(() => {
        if (!!qrGenerated) {
            loginModelRef.current?.open();
        } else {
            loginModelRef.current?.close();
        }
    }, [qrGenerated]);

    const logoutHandler = async () => {
        await logout();
        localStorage.removeItem('token');
        saveClientID('');
        navigate(NAVIGATION.WELCOME);
    };

    return (
        <>
            <Box width="full" py={'1rem'} px={'1rem'}>
                <Header />

                {isAuthenticating || !PHONE_NUMBER ? (
                    <Text
                        className="text-black dark:text-white animate-pulse"
                        fontSize={'md'}
                        fontWeight={'medium'}
                        marginTop={'130px'}
                        textAlign={'center'}
                    >
                        Loading...
                    </Text>
                ) : (
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
                                    {NAME}
                                </Text>
                                <Text className="text-gray-800 dark:text-gray-300">
                                    {USER_TYPE}
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
                                    {PHONE_NUMBER ? `+${PHONE_NUMBER}` : ''}
                                </Text>
                            </Box>
                        </section>

                        <section>
                            <Flex
                                marginTop={'1rem'}
                                rounded={'md'}
                                alignItems={'center'}
                            >
                                <Text color="gray.400" fontWeight={'semibold'}>
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
                                    IS_SUBSCRIBED
                                        ? 'dark:bg-[#235C39] bg-[#B4FED0]'
                                        : 'dark:bg-[#FFC9C9] bg-[#541919]'
                                }`}
                                paddingX={'1rem'}
                                paddingY={'0.5rem'}
                                width={'max-content'}
                                rounded={'md'}
                            >
                                <Text
                                    textColor={
                                        IS_SUBSCRIBED ? '#34F27B' : '#FF2626'
                                    }
                                >
                                    {IS_SUBSCRIBED
                                        ? 'Active'
                                        : 'Not Subscribed'}
                                </Text>
                            </Box>
                            {IS_SUBSCRIBED ? (
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
                                        Expires On {SUBSCRIPTION_EXPIRATION}
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
                                <Text color="gray.400" fontWeight={'semibold'}>
                                    Payment History
                                </Text>
                                <Box
                                    bgColor={'gray.400'}
                                    flexGrow={'1'}
                                    height={'2px'}
                                    marginLeft={'1rem'}
                                />
                            </Flex>

                            <Flex
                                marginTop={'0.25rem'}
                                paddingX={'1rem'}
                                paddingY={'0.5rem'}
                                alignItems={'center'}
                                rounded={'md'}
                                flexDirection={'column'}
                                hidden={PAYMENT_RECORDS.length === 0}
                            >
                                <Button
                                    variant="solid"
                                    backgroundColor={'green.500'}
                                    marginX={'auto'}
                                    color={'white'}
                                    onClick={() =>
                                        ExportsService.exportPaymentsExcel(
                                            PAYMENT_RECORDS.map((payment) => {
                                                if (
                                                    payment.type === 'payment'
                                                ) {
                                                    return {
                                                        date: payment.date,
                                                        amount: payment.amount,
                                                    };
                                                }
                                                return null;
                                            }).filter(
                                                (payment) => payment !== null
                                            ) as {
                                                date: string;
                                                amount: number;
                                            }[]
                                        )
                                    }
                                    _hover={{
                                        backgroundColor: 'green.600',
                                    }}
                                >
                                    Export
                                </Button>
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
                                                                <Td isNumeric>
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
                                                                <Td isNumeric>
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
                            </Flex>
                        </section>
                        <section>
                            <Button
                                bgColor={'red.300'}
                                _hover={{
                                    bgColor: 'red.400',
                                }}
                                width={'full'}
                                marginTop={'0.5rem'}
                                onClick={logoutHandler}
                            >
                                <Flex gap={'0.5rem'}>
                                    <WarningTwoIcon width={4} color={'white'} />
                                    <Text color={'white'}>Logout</Text>
                                </Flex>
                            </Button>
                        </section>
                    </Box>
                )}

                <LoginModal ref={loginModelRef} qr={qrCode} />
            </Box>
        </>
    );
}
