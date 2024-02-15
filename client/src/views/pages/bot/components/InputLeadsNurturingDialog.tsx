import { AddIcon } from '@chakra-ui/icons';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Button,
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
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export type InputLeadsNurturingDialogHandle = {
	open: (
		nurturing: {
			message: string;
			delay: string;
			unit: 'MINUTES' | 'HOURS' | 'DAYS';
			start_from: string;
			end_at: string;
		}[]
	) => void;
	close: () => void;
};

type Props = {
	onConfirm: (
		nurturing: {
			message: string;
			delay: string;
			unit: 'MINUTES' | 'HOURS' | 'DAYS';
			start_from: string;
			end_at: string;
		}[]
	) => void;
};

const InputLeadsNurturingDialog = forwardRef<InputLeadsNurturingDialogHandle, Props>(
	({ onConfirm }, ref) => {
		const [open, setOpen] = useState(false);
		const messageRef = useRef<HTMLTextAreaElement>(null);

		const [nurturing, setNurturing] = useState<
			{
				message: string;
				delay: string;
				unit: 'MINUTES' | 'HOURS' | 'DAYS';
				start_from: string;
				end_at: string;
			}[]
		>([]);

		const [error, setError] = useState<{
			message: string;
			type: string;
			index: number;
		}>({
			message: '',
			type: '',
			index: -1,
		});

		const addBlankNurturing = () => {
			setNurturing((prev) => [
				...prev,
				{
					message: '',
					delay: '1',
					unit: 'MINUTES',
					start_from: '10:00',
					end_at: '18:00',
				},
			]);
		};

		const deleteNurturing = (index: number) => {
			setNurturing((prev) => {
				const newNurturing = [...prev];
				newNurturing.splice(index, 1);
				return newNurturing;
			});
		};

		const handleChange = (type: string, value: string, index: number) => {
			setError({ message: '', type: '', index: -1 });
			setNurturing((prev) => [
				...prev.slice(0, index),
				{ ...prev[index], [type]: value },
				...prev.slice(index + 1),
			]);
		};

		const handleClose = () => {
			setOpen(false);
		};

		const handleSave = () => {
			let hasError = false;
			for (let i = 0; i < nurturing.length; i++) {
				if (nurturing[i].delay.trim() === '' || nurturing[i].delay.trim() <= '0') {
					setError({ message: 'Invalid Delay', type: 'delay', index: i });
					hasError = true;
					break;
				}
				if (nurturing[i].message.trim() === '') {
					setError({ message: 'Message is required', type: 'message', index: i });
					hasError = true;
					break;
				}
			}
			if (hasError) return;
			onConfirm(nurturing);
			handleClose();
		};

		const insertVariablesToMessage = (variable: string, index: number) => {
			const text =
				nurturing[index].message.substring(0, messageRef.current?.selectionStart) +
				' ' +
				variable +
				' ' +
				nurturing[index].message.substring(
					messageRef.current?.selectionEnd ?? 0,
					nurturing[index].message.length
				);
			handleChange('message', text, index);
		};

		useImperativeHandle(ref, () => ({
			open: (
				nurturing: {
					message: string;
					delay: string;
					unit: 'MINUTES' | 'HOURS' | 'DAYS';
					start_from: string;
					end_at: string;
				}[]
			) => {
				setNurturing(nurturing);
				setOpen(true);
			},
			close: () => {
				setOpen(false);
			},
		}));

		return (
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
												<HStack width={'max-content'} alignItems={'center'}>
													<Text fontSize={'lg'} flex={1}>
														Send this message after{' '}
													</Text>
													<HStack flex={1}>
														<Input
															type='number'
															placeholder='Delay'
															value={nurturing.delay ?? ''}
															onChange={(e) => handleChange('delay', e.target.value, index)}
														/>
														<Select
															value={nurturing.unit ?? 'min'}
															onChange={(e) => handleChange('unit', e.target.value, index)}
														>
															<option value={'MINUTES'}>Minutes</option>
															<option value={'HOURS'}>Hours</option>
															<option value={'DAYS'}>Days</option>
														</Select>
													</HStack>
													<Text fontSize={'lg'} flex={1}>
														from the previous message
													</Text>
												</HStack>
												<HStack pt={'1rem'} width={'min-content'}>
													<Text fontSize={'lg'}>between</Text>
													<Input
														type='time'
														value={nurturing.start_from}
														onChange={(e) => handleChange('start_from', e.target.value, index)}
													/>
													<Text fontSize={'lg'}>to</Text>
													<Input
														type='time'
														value={nurturing.end_at}
														onChange={(e) => handleChange('end_at', e.target.value, index)}
													/>
												</HStack>
											</FormControl>
											<FormControl isInvalid={error.type === 'message' && error.index === index}>
												<Textarea
													ref={messageRef}
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
											<Button
												alignSelf={'flex-end'}
												onClick={() => deleteNurturing(index)}
												colorScheme='red'
												variant={'outline'}
											>
												Delete
											</Button>
										</VStack>
									</AccordionPanel>
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
		);
	}
);

export default InputLeadsNurturingDialog;
