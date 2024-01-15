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
import { forwardRef, useImperativeHandle, useReducer, useState } from 'react';

type Poll = {
	title: string;
	options: string[];
	isMultiSelect: boolean;
};

export type PollInputDialogHandle = {
	open: (polls: Poll[]) => void;
	close: () => void;
};

type Props = {
	onConfirm: (polls: Poll[]) => void;
};

// Define the action type
type AppAction =
	| { type: 'SET_POLLS'; polls: Poll[] }
	| { type: 'ADD_POLL' }
	| { type: 'DELETE_POLL'; index: number }
	| { type: 'TITLE'; index: number; payload: string }
	| { type: 'OPTION_ADD'; index: number }
	| { type: 'OPTION_UPDATED'; index: number; payload: string; selected_option: number }
	| { type: 'OPTION_DELETE'; index: number; selected_option: number }
	| { type: 'MULTI_SELECT_TOGGLE'; index: number; checked: boolean };

function pollsReducer(state: Poll[], action: AppAction) {
	switch (action.type) {
		case 'SET_POLLS': {
			return action.polls;
		}
		case 'ADD_POLL': {
			return [
				...state,
				{
					title: '',
					options: ['', ''],
					isMultiSelect: false,
				},
			];
		}
		case 'DELETE_POLL': {
			return state.filter((_, index) => index !== action.index);
		}
		case 'TITLE': {
			return state.map((poll, index) => {
				if (index === action.index) {
					poll.title = action.payload;
				}
				return poll;
			});
		}
		case 'OPTION_ADD': {
			return state.map((poll, index) => {
				if (index === action.index) {
					poll.options.push('');
				}
				return poll;
			});
		}
		case 'OPTION_UPDATED': {
			return state.map((poll, index) => {
				if (index === action.index) {
					poll.options[action.selected_option] = action.payload;
				}
				return poll;
			});
		}
		case 'OPTION_DELETE': {
			const selectedIndex = action.index ?? 0;
			const selected_option = action.selected_option ?? 0;
			return state.map((poll, index) => {
				if (index === selectedIndex) {
					poll.options = poll.options.splice(selected_option, 1);
				}
				return poll;
			});
		}
		case 'MULTI_SELECT_TOGGLE': {
			return state.map((poll, index) => {
				if (index === action.index) {
					poll.isMultiSelect = action.checked;
				}

				return poll;
			});
		}
	}
	return state;
}

const PollInputDialog = forwardRef<PollInputDialogHandle, Props>(({ onConfirm }: Props, ref) => {
	const [isOpen, setOpen] = useState(false);

	const [polls, dispatch] = useReducer(pollsReducer, [
		{
			title: '',
			options: ['', ''],
			isMultiSelect: false,
		},
	]);

	const [error, setError] = useState<{
		pollIndex: number;
		error: string;
	} | null>(null);

	const onClose = () => {
		setOpen(false);
	};

	useImperativeHandle(ref, () => ({
		open: (polls: Poll[]) => {
			const copy = polls.map((poll) => {
				return {
					title: poll.title,
					options: poll.options.map((option) => option),
					isMultiSelect: poll.isMultiSelect,
				};
			});
			dispatch({ type: 'SET_POLLS', polls: copy });
			setOpen(true);
			setError({
				pollIndex: 0,
				error: '',
			});
		},
		close: () => {
			dispatch({ type: 'SET_POLLS', polls: [] });
			setError({
				pollIndex: 0,
				error: '',
			});
			setOpen(false);
		},
	}));

	const validatePolls = () => {
		for (let i = 0; i < polls.length; i++) {
			if (polls[i].title.trim() === '') {
				setError({
					pollIndex: i,
					error: 'Poll title required.',
				});
				return false;
			}
			if (polls[i].options.length < 2) {
				setError({
					pollIndex: i,
					error: 'Please add at least two option',
				});
				return false;
			}
			for (let j = 0; j < polls[i].options.length; j++) {
				if (polls[i].options[j].trim() === '') {
					setError({
						pollIndex: i,
						error: 'Please Remove unused polls',
					});
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
							onClick={() => dispatch({ type: 'ADD_POLL' })}
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
									<FormControl isInvalid={error?.pollIndex === pollIndex && !!error.error}>
										<FormLabel>Question</FormLabel>

										<Input
											placeholder={'Enter Poll Question'}
											value={poll.title}
											onChange={(e) =>
												dispatch({ type: 'TITLE', index: pollIndex, payload: e.target.value })
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
											onClick={() => dispatch({ type: 'OPTION_ADD', index: pollIndex })}
										/>
									</HStack>
									<FormControl isInvalid={error?.pollIndex === pollIndex && !!error.error}>
										{poll.options.map((option, optionIndex) => (
											<HStack mb={'0.5rem'} key={optionIndex}>
												<Input
													placeholder={`Enter Option ${optionIndex + 1}`}
													value={option}
													onChange={(e) => {
														dispatch({
															type: 'OPTION_UPDATED',
															index: pollIndex,
															payload: e.target.value,
															selected_option: optionIndex,
														});
													}}
												/>
												{optionIndex > 1 && (
													<IconButton
														aria-label={'Delete Option'}
														icon={<DeleteIcon />}
														colorScheme='red'
														onClick={() =>
															dispatch({
																type: 'OPTION_DELETE',
																index: pollIndex,
																selected_option: optionIndex,
															})
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
													dispatch({
														type: 'MULTI_SELECT_TOGGLE',
														index: pollIndex,
														checked: e.target.checked,
													})
												}
											/>
										</FormControl>
										<Button
											leftIcon={<DeleteIcon />}
											colorScheme='red'
											size={'sm'}
											onClick={() =>
												dispatch({
													type: 'DELETE_POLL',
													index: pollIndex,
												})
											}
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
					{error?.error && (
						<Text width={'full'} color={'red'} textAlign={'left'}>
							{error.error}
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
