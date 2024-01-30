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
	Text,
	Textarea,
	VStack,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type InputLeadsNurturingDialogHandle = {
	open: (
		nurturing: {
			message: string;
			delay: string;
			unit: 'MINUTES' | 'HOURS' | 'DAYS';
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
		}[]
	) => void;
};

const InputLeadsNurturingDialog = forwardRef<InputLeadsNurturingDialogHandle, Props>(
	({ onConfirm }, ref) => {
		const [open, setOpen] = useState(false);

		const [nurturing, setNurturing] = useState<
			{
				message: string;
				delay: string;
				unit: 'MINUTES' | 'HOURS' | 'DAYS';
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

		useImperativeHandle(ref, () => ({
			open: (
				nurturing: {
					message: string;
					delay: string;
					unit: 'MINUTES' | 'HOURS' | 'DAYS';
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
												<HStack width={'full'} alignItems={'flex-end'}>
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
														<option value={'sec'}>Sec</option>
														<option value={'min'}>Min</option>
														<option value={'hr'}>Hour</option>
													</Select>
												</HStack>
											</FormControl>
											<FormControl isInvalid={error.type === 'message' && error.index === index}>
												<Textarea
													placeholder='Enter Message'
													value={nurturing.message ?? ''}
													onChange={(e) => handleChange('message', e.target.value, index)}
												/>
											</FormControl>
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
							Add
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}
);

export default InputLeadsNurturingDialog;
