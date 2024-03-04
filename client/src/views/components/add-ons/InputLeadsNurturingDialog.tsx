import { AddIcon } from '@chakra-ui/icons';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Button,
	Flex,
	FormControl,
	HStack,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Tag,
	TagLabel,
	Text,
	Textarea,
	VStack,
} from '@chakra-ui/react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Poll } from '../../../store/types/PollState';
import PollInputDialog, { PollInputDialogHandle } from '../polls-input-dialog';
import AttachmentSelectorDialog, {
	AttachmentDialogHandle,
} from '../selector-dialog/AttachmentSelectorDialog';
import ContactSelectorDialog, {
	ContactDialogHandle,
} from '../selector-dialog/ContactSelectorDialog';

const initialState = [
	{
		message: '',
		after: 60,
		start_from: '10:00',
		end_at: '18:00',
		shared_contact_cards: [],
		attachments: [],
		polls: [],
	},
];
const blankNurturing = {
	message: '',
	delay: '1',
	unit: 'MINUTES' as 'MINUTES' | 'HOURS' | 'DAYS',
	start_from: '10:00',
	end_at: '18:00',
	shared_contact_cards: [] as string[],
	attachments: [] as string[],
	polls: [] as Poll[],
};

export type InputLeadsNurturingDialogHandle = {
	open: (
		nurturing?: {
			message: string;
			after: number;
			start_from: string;
			end_at: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: Poll[];
		}[]
	) => void;
	close: () => void;
};

type Props = {
	onConfirm: (
		nurturing: {
			message: string;
			after: number;
			start_from: string;
			end_at: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: Poll[];
		}[]
	) => void;
};

const InputLeadsNurturingDialog = forwardRef<InputLeadsNurturingDialogHandle, Props>(
	({ onConfirm }, ref) => {
		const [open, setOpen] = useState(false);
		const messageRef = useRef<(HTMLTextAreaElement | null)[]>([]);
		const attachmentSelectorRef = useRef<(AttachmentDialogHandle | null)[]>([]);
		const contactSelectorRef = useRef<(ContactDialogHandle | null)[]>([]);
		const pollInputRef = useRef<(PollInputDialogHandle | null)[]>([]);

		const [nurturing, setNurturing] = useState<(typeof blankNurturing)[]>([]);

		const [error, setError] = useState<{
			message: string;
			type: string;
			index: number;
		}>({
			message: '',
			type: '',
			index: -1,
		});

		useEffect(() => {
			messageRef.current = messageRef.current.slice(0, nurturing.length);
			attachmentSelectorRef.current = attachmentSelectorRef.current.slice(0, nurturing.length);
			contactSelectorRef.current = contactSelectorRef.current.slice(0, nurturing.length);
			pollInputRef.current = pollInputRef.current.slice(0, nurturing.length);
		}, [nurturing]);

		const deleteNurturing = (index: number) =>
			setNurturing((prev) => prev.filter((_, n) => n !== index));

		const addBlankNurturing = () => setNurturing((prev) => [...prev, blankNurturing]);

		const handleClose = () => setOpen(false);

		const handleChange = (type: string, value: string | string[] | Poll[], index: number) => {
			setError({ message: '', type: '', index: -1 });
			setNurturing((prev) => [
				...prev.slice(0, index),
				{ ...prev[index], [type]: value },
				...prev.slice(index + 1),
			]);
		};

		const handleSave = () => {
			let hasError = false;
			for (let i = 0; i < nurturing.length; i++) {
				if (nurturing[i].delay.trim() === '' || nurturing[i].delay.trim() <= '0') {
					setError({ message: 'Invalid Delay', type: 'delay', index: i });
					hasError = true;
					break;
				}
				if (
					nurturing[i].message.trim().length === 0 &&
					nurturing[i].attachments.length === 0 &&
					nurturing[i].shared_contact_cards.length === 0 &&
					nurturing[i].polls.length === 0
				) {
					setError({ message: 'Message is required', type: 'message', index: i });
					hasError = true;
					break;
				}
			}
			if (hasError) return;
			onConfirm(
				nurturing.map((nurturing) => ({
					message: nurturing.message,
					after:
						nurturing.unit === 'DAYS'
							? Number(nurturing.delay) * 86400
							: nurturing.unit === 'HOURS'
							? Number(nurturing.delay) * 3600
							: Number(nurturing.delay) * 60,
					start_from: nurturing.start_from,
					end_at: nurturing.end_at,
					shared_contact_cards: nurturing.shared_contact_cards,
					attachments: nurturing.attachments,
					polls: nurturing.polls,
				}))
			);
			handleClose();
		};

		const insertVariablesToMessage = (variable: string, index: number) => {
			const startIndex = messageRef.current?.[index]?.selectionStart ?? 0;
			const msg = nurturing[index].message;
			const text = msg.substring(0, startIndex) + ' ' + variable + ' ' + msg.substring(startIndex);
			handleChange('message', text, index);
		};

		useImperativeHandle(ref, () => ({
			open: (nurturing = initialState) => {
				setOpen(true);
				const processed = nurturing.map((el) => {
					let unit = 'MINUTES' as 'MINUTES' | 'HOURS' | 'DAYS';
					let delay = el.after;
					if (delay >= 86400) {
						delay = delay / 86400;
						unit = 'DAYS';
					} else if (delay >= 3600) {
						delay = delay / 3600;
						unit = 'HOURS';
					} else {
						delay = delay / 60;
						unit = 'MINUTES';
					}
					return {
						...el,
						delay: delay.toString(),
						unit,
						end_at: el.end_at,
						start_from: el.start_from,
						after: undefined,
					};
				});
				setNurturing(processed);
			},
			close: () => {
				setOpen(false);
			},
		}));

		return (
			<>
				<Modal isOpen={open} onClose={handleClose} size={'4xl'} scrollBehavior='inside'>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>
							<HStack width={'full'} justifyContent={'space-between'}>
								<Text>Leads Nurturing</Text>
								<IconButton
									colorScheme='green'
									aria-label='add blank nurturing'
									icon={<AddIcon />}
									onClick={addBlankNurturing}
								/>
							</HStack>
						</ModalHeader>
						<ModalBody>
							<Accordion allowMultiple>
								{nurturing.map((nurturing, index) => (
									<AccordionItem key={index}>
										<AccordionButton>
											<Text>Nurturing {index + 1}</Text>
											<AccordionIcon />
										</AccordionButton>
										<AccordionPanel>
											<VStack>
												<FormControl isInvalid={error.type === 'delay' && error.index === index}>
													<Flex alignItems={'center'} gap={'0.5rem'} width='full' flexWrap={'wrap'}>
														<Text fontSize={'lg'}>Send this message after </Text>
														<Input
															type='number'
															width={'100px'}
															textAlign={'right'}
															placeholder='Delay'
															value={nurturing.delay ?? ''}
															onChange={(e) => handleChange('delay', e.target.value, index)}
														/>
														<Select
															value={nurturing.unit ?? 'min'}
															width={'max-content'}
															onChange={(e) => handleChange('unit', e.target.value, index)}
														>
															<option value={'MINUTES'}>Minutes</option>
															<option value={'HOURS'}>Hours</option>
															<option value={'DAYS'}>Days</option>
														</Select>
														<Text fontSize={'lg'}>from the previous message between</Text>
														<Input
															width={'fit-content'}
															type='time'
															value={nurturing.start_from}
															onChange={(e) => handleChange('start_from', e.target.value, index)}
														/>
														<Text fontSize={'lg'}>to</Text>
														<Input
															width={'fit-content'}
															type='time'
															value={nurturing.end_at}
															onChange={(e) => handleChange('end_at', e.target.value, index)}
														/>
													</Flex>
												</FormControl>
												<FormControl isInvalid={error.type === 'message' && error.index === index}>
													<Textarea
														ref={(el) => (messageRef.current[index] = el)}
														placeholder='Enter Message'
														value={nurturing.message ?? ''}
														onChange={(e) => handleChange('message', e.target.value, index)}
													/>
												</FormControl>
												<Tag
													size={'sm'}
													m={'0.25rem'}
													p={'0.5rem'}
													width={'fit-content'}
													borderRadius='md'
													variant='solid'
													colorScheme='gray'
													_hover={{ cursor: 'pointer' }}
													onClick={() => insertVariablesToMessage('{{public_name}}', index)}
												>
													<TagLabel>{'{{public_name}}'}</TagLabel>
												</Tag>
												<HStack width={'full'}>
													<Box flex={1}>
														<Text className='text-gray-700 dark:text-gray-400'>Attachments</Text>
														<Button
															width={'full'}
															size={'sm'}
															variant={'outline'}
															colorScheme='green'
															onClick={() =>
																attachmentSelectorRef.current[index]?.open(nurturing.attachments)
															}
														>
															Select Attachments ({nurturing.attachments.length}) Selected
														</Button>
													</Box>
													<Box flex={1}>
														<Text className='text-gray-700 dark:text-gray-400'>Contact Card</Text>
														<Button
															width={'full'}
															size={'sm'}
															variant={'outline'}
															colorScheme='green'
															onClick={() =>
																contactSelectorRef.current[index]?.open(
																	nurturing.shared_contact_cards
																)
															}
														>
															Select Contacts ({nurturing.shared_contact_cards.length}) Selected
														</Button>
													</Box>
													<Box flex={1}>
														<Text className='text-gray-700 dark:text-gray-400'>Polls</Text>
														<Button
															width={'full'}
															size={'sm'}
															variant={'outline'}
															colorScheme='green'
															onClick={() => {
																if (nurturing.polls.length === 0) {
																	pollInputRef.current[index]?.open([
																		{
																			title: '',
																			options: ['', ''],
																			isMultiSelect: false,
																		},
																	]);
																} else {
																	pollInputRef.current[index]?.open(nurturing.polls);
																}
															}}
														>
															Add Polls ({nurturing.polls.length}) Added
														</Button>
													</Box>
													<Button
														alignSelf={'flex-end'}
														onClick={() => deleteNurturing(index)}
														colorScheme='red'
														variant={'outline'}
														size={'sm'}
													>
														Delete
													</Button>
												</HStack>
											</VStack>
										</AccordionPanel>
										<AttachmentSelectorDialog
											ref={(elRef) => (attachmentSelectorRef.current[index] = elRef)}
											onConfirm={(ids) => handleChange('attachments', ids, index)}
										/>
										<ContactSelectorDialog
											ref={(elRef) => (contactSelectorRef.current[index] = elRef)}
											onConfirm={(ids) => handleChange('shared_contact_cards', ids, index)}
										/>
										<PollInputDialog
											ref={(elRef) => (pollInputRef.current[index] = elRef)}
											onConfirm={(ids) => handleChange('polls', ids, index)}
										/>
									</AccordionItem>
								))}
							</Accordion>
						</ModalBody>

						<ModalFooter>
							{error.message && (
								<Text color={'red.500'} mr={'auto'}>
									{error.message}
								</Text>
							)}
							<Button colorScheme='red' mr={3} onClick={handleClose}>
								Close
							</Button>
							<Button colorScheme='green' onClick={handleSave}>
								Save
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</>
		);
	}
);

export default InputLeadsNurturingDialog;
