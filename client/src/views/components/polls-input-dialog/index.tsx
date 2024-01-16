import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Button,
	FormControl,
	FormLabel,
	HStack,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Switch,
	Text,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../store';
import {
	addBlankPoll,
	addBlankPollOption,
	deletePoll,
	deletePollOption,
	reset,
	setError,
	setIsMultiSelect,
	setOptions,
	setPoll,
	setTitle,
} from '../../../store/reducers/PollReducers';

export type PollInputDialogHandle = {
	open: (
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[]
	) => void;
	close: () => void;
};

type Props = {
	onConfirm: (
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[]
	) => void;
};

// Define the action type

const PollInputDialog = forwardRef<PollInputDialogHandle, Props>(({ onConfirm }: Props, ref) => {
	const [isOpen, setOpen] = useState(false);
	const dispatch = useDispatch();

	const { polls, error } = useSelector((state: StoreState) => state[StoreNames.POLL]);

	const onClose = () => {
		setOpen(false);
	};

	useImperativeHandle(ref, () => ({
		open: (
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[]
		) => {
			dispatch(setPoll(polls));
			setOpen(true);
		},
		close: () => {
			setOpen(false);
		},
	}));

	const validatePolls = () => {
		for (let i = 0; i < polls.length; i++) {
			if (polls[i].title.trim() === '') {
				dispatch(
					setError({
						pollIndex: i,
						message: 'Poll title required.',
					})
				);
				return false;
			}
			if (polls[i].options.length < 2) {
				dispatch(
					setError({
						pollIndex: i,
						message: 'Please add at least two option',
					})
				);
				return false;
			}
			for (let j = 0; j < polls[i].options.length; j++) {
				if (polls[i].options[j].trim() === '') {
					dispatch(
						setError({
							pollIndex: i,
							message: 'Please Remove unused polls',
						})
					);
					return false;
				}
			}
		}
		return true;
	};

	const handleAdd = () => {
		if (!validatePolls()) {
			return;
		}
		onConfirm(polls);
		onClose();
	};

	const handleCancel = () => {
		dispatch(reset());
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<HStack justifyContent={'space-between'}>
						<Text>Create Polls</Text>
						<Button
							leftIcon={<AddIcon />}
							colorScheme='whatsapp'
							onClick={() => dispatch(addBlankPoll())}
						>
							Add Poll
						</Button>
					</HStack>
				</ModalHeader>
				<ModalBody>
					<Accordion allowMultiple>
						{polls.map((poll, pollIndex) => (
							<AccordionItem key={pollIndex}>
								<AccordionButton>
									<Box as='span' flex='1' textAlign='left'>
										Poll {pollIndex + 1}
									</Box>
									<AccordionIcon />
								</AccordionButton>
								<AccordionPanel pb={4}>
									<FormControl isInvalid={error.pollIndex === pollIndex && !!error.message}>
										<FormLabel>Question</FormLabel>

										<Input
											placeholder={'Enter Poll Question'}
											value={poll.title}
											onChange={(e) =>
												dispatch(
													setTitle({
														title: e.target.value,
														pollIndex,
													})
												)
											}
										/>
									</FormControl>
									<HStack justifyContent={'space-between'} py={'1rem'}>
										<Text fontWeight={'medium'} mt={'0.5rem'}>
											Options
										</Text>
										<IconButton
											aria-label={'Add Option'}
											icon={<AddIcon />}
											size={'sm'}
											colorScheme='green'
											onClick={() => dispatch(addBlankPollOption(pollIndex))}
										/>
									</HStack>
									<FormControl isInvalid={error.pollIndex === pollIndex && !!error.message}>
										{poll.options.map((option, optionIndex) => (
											<HStack mb={'0.5rem'} key={optionIndex}>
												<Input
													placeholder={`Enter Option ${optionIndex + 1}`}
													value={option}
													onChange={(e) => {
														dispatch(
															setOptions({
																option: e.target.value,
																pollIndex,
																optionIndex,
															})
														);
													}}
												/>
												{optionIndex > 1 && (
													<IconButton
														aria-label={'Delete Option'}
														icon={<DeleteIcon />}
														colorScheme='red'
														onClick={() =>
															dispatch(
																deletePollOption({
																	pollIndex,
																	optionIndex,
																})
															)
														}
													/>
												)}
											</HStack>
										))}
									</FormControl>
									<HStack>
										<FormControl display={'flex'} alignItems={'center'} pt={'0.5rem'}>
											<FormLabel mb={0}>Allow Multiple Selections</FormLabel>
											<Switch
												isChecked={poll.isMultiSelect}
												onChange={(e) =>
													dispatch(
														setIsMultiSelect({
															isMultiSelect: e.target.checked,
															pollIndex,
														})
													)
												}
											/>
										</FormControl>
										<Button
											leftIcon={<DeleteIcon />}
											colorScheme='red'
											size={'sm'}
											onClick={() => dispatch(deletePoll(pollIndex))}
											px={'1.5rem'}
										>
											<Text>Delete this Poll</Text>
										</Button>
									</HStack>
								</AccordionPanel>
							</AccordionItem>
						))}
					</Accordion>
				</ModalBody>
				<ModalFooter width={'full'}>
					{error.pollIndex !== -1 && (
						<Text textAlign={'left'} width={'full'} color={'red.500'}>
							{error.message}
						</Text>
					)}
					<Button mr={'1rem'} colorScheme='red' onClick={handleCancel}>
						Cancel
					</Button>
					<Button colorScheme={'green'} onClick={handleAdd}>
						Confirm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default PollInputDialog;
