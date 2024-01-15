import { EditIcon } from '@chakra-ui/icons';
import {
    Box,
    IconButton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useTheme } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { MdDelete, MdHistory } from 'react-icons/md';
import { PiPause, PiPlay } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import BotService from '../../../../services/bot.service';
import { StoreNames, StoreState } from '../../../../store';
import {
    removeBot,
    setBots,
    setSelectedBot,
    updateBot,
} from '../../../../store/reducers/BotReducers';
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';

export default function AllResponders() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { all_bots } = useSelector(
        (state: StoreState) => state[StoreNames.CHATBOT]
    );
    const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

    useEffect(() => {
        BotService.listBots().then((res) => {
            dispatch(setBots(res));
        });
    }, [dispatch]);

    const deleteBot = (id: string) => {
        BotService.deleteBot(id).then((res) => {
            if (!res) return;
            dispatch(removeBot(id));
        });
    };

    const toggleBot = (id: string) => {
        BotService.toggleBot(id).then((res) => {
            if (!res) {
                return;
            }
            dispatch(updateBot({ id, data: res }));
        });
    };

    return (
        <>
            <Text
                fontSize={'2xl'}
                className="text-gray-700 dark:text-gray-400"
                textAlign={'center'}
                pt={'2rem'}
                pb={'1rem'}
            >
                All Responders
            </Text>
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th width={'35%'}>Trigger</Th>
                            <Th width={'35%'}>Message</Th>
                            <Th width={'5%'}>Recipients</Th>
                            <Th width={'5%'}>Conditions</Th>
                            <Th width={'5%'}>Attachments/Contacts</Th>
                            <Th width={'5%'}>Delay</Th>
                            <Th width={'10%'}>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody textColor={theme === 'dark' ? 'white' : 'black'}>
                        {all_bots.map((bot, index) => (
                            <Tr key={index}>
                                <Td>
                                    {bot.trigger
                                        .split('\n')
                                        .map((trigger, index) => (
                                            <Box key={index}>
                                                {trigger.length > 20
                                                    ? trigger.substring(0, 18) +
                                                      '...'
                                                    : trigger}
                                            </Box>
                                        ))}
                                </Td>
                                <Td>
                                    <Box>
                                        {bot.message
                                            .split('\n')
                                            .map((message, index) => (
                                                <Box key={index}>
                                                    {message.length > 20
                                                        ? message.substring(
                                                              0,
                                                              18
                                                          ) + '...'
                                                        : message}
                                                </Box>
                                            ))}
                                    </Box>
                                </Td>
                                <Td>{bot.respond_to.split('_').join(' ')}</Td>
                                <Td>{bot.options.split('_').join(' ')}</Td>
                                <Td>
                                    {bot.attachments.length} /{' '}
                                    {bot.shared_contact_cards.length}
                                </Td>
                                <Td>
                                    {bot.trigger_gap_seconds < 60
                                        ? `${bot.trigger_gap_seconds} s`
                                        : bot.trigger_gap_seconds < 3600
                                        ? `${Math.floor(
                                              bot.trigger_gap_seconds / 60
                                          )} m`
                                        : bot.trigger_gap_seconds < 86400
                                        ? `${Math.floor(
                                              bot.trigger_gap_seconds / 3600
                                          )} h`
                                        : `${Math.floor(
                                              bot.trigger_gap_seconds / 86400
                                          )} day`}
                                </Td>
                                <Td>
                                    <IconButton
                                        aria-label="Delete"
                                        icon={<MdDelete />}
                                        color={'red.400'}
                                        onClick={() => {
                                            confirmationDialogRef.current?.open(
                                                bot.bot_id
                                            );
                                        }}
                                        bgColor={'transparent'}
                                        _hover={{
                                            bgColor: 'transparent',
                                        }}
                                        outline="none"
                                        border="none"
                                    />
                                    <IconButton
                                        aria-label="Edit"
                                        icon={<EditIcon />}
                                        color={'yellow.400'}
                                        onClick={() =>
                                            dispatch(setSelectedBot(bot.bot_id))
                                        }
                                        bgColor={'transparent'}
                                        _hover={{
                                            bgColor: 'transparent',
                                        }}
                                        outline="none"
                                        border="none"
                                    />
                                    <IconButton
                                        aria-label="toggle"
                                        icon={
                                            bot.isActive ? (
                                                <PiPause />
                                            ) : (
                                                <PiPlay />
                                            )
                                        }
                                        color={
                                            bot.isActive
                                                ? 'blue.400'
                                                : 'green.400'
                                        }
                                        onClick={() => {
                                            toggleBot(bot.bot_id);
                                        }}
                                        bgColor={'transparent'}
                                        _hover={{
                                            bgColor: 'transparent',
                                        }}
                                        outline="none"
                                        border="none"
                                    />
                                    <IconButton
                                        aria-label="History"
                                        icon={<MdHistory />}
                                        color={'red.400'}
                                        onClick={() => {}}
                                        bgColor={'transparent'}
                                        _hover={{
                                            bgColor: 'transparent',
                                        }}
                                        outline="none"
                                        border="none"
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            <ConfirmationDialog
                type={'Responder'}
                ref={confirmationDialogRef}
                onConfirm={deleteBot}
            />
        </>
    );
}
