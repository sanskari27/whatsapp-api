import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
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
	Select,
	Switch,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import useTemplate from '../../../hooks/useTemplate';
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
	setPollAt,
	setTitle,
} from '../../../store/reducers/PollReducers';
import { TemplateNameInputDialog } from '../../pages/scheduler/components';

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

const PollInputDialog = forwardRef<PollInputDialogHandle, Props>(({ onConfirm }: Props, ref) => {
	const [isOpen, setOpen] = useState(false);
	const dispatch = useDispatch();

	const { polls, error } = useSelector((state: StoreState) => state[StoreNames.POLL]);

	const {
		isOpen: isNameInputOpen,
		onOpen: openNameInput,
		onClose: closeNameInput,
	} = useDisclosure();

	const {
		templates,
		add: addToTemplate,
		addingTemplate,
		update: updateTemplate,
		remove: removeTemplate,
	} = useTemplate('poll');
	const [selectedTemplate, setSelectedTemplate] = useState({
		id: '',
		name: '',
	});

	const onClose = () => setOpen(false);

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
									<Flex gap={3} alignItems={'center'}>
										<Select
											className='text-black  !bg-[#ECECEC] '
											border={'none'}
											rounded={'md'}
											onChange={(e) => {
												const template = templates.find((el) => el.id === e.target.value);
												if (!template) {
													setSelectedTemplate({
														id: '',
														name: '',
													});
													return;
												}
												dispatch(
													setPollAt({
														poll: template.poll,
														pollIndex,
													})
												);
												setSelectedTemplate({
													id: template.id,
													name: template.name,
												});
											}}
										>
											<option
												className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
												value={''}
												data-id={''}
												data-name={''}
											>
												Select template!
											</option>
											{(templates ?? []).map(({ name, id }, index) => (
												<option
													className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
													value={id}
													key={index}
													data-id={id}
													data-name={name}
												>
													{name}
												</option>
											))}
										</Select>
										<HStack>
											<Button
												width={'200px'}
												colorScheme='green'
												aria-label='Add Template'
												rounded={'md'}
												isLoading={addingTemplate}
												leftIcon={<AddIcon />}
												onClick={() => {
													if (!poll.title || poll.options.length === 0) return;
													openNameInput();
												}}
												fontSize={'sm'}
												px={4}
											>
												Add Template
											</Button>
											<IconButton
												aria-label='Edit'
												icon={<EditIcon />}
												color={'yellow.600'}
												isDisabled={!selectedTemplate.id}
												onClick={() =>
													updateTemplate(selectedTemplate.id, {
														name: selectedTemplate.name,
														poll,
													})
												}
											/>
											<IconButton
												aria-label='Delete'
												icon={<MdDelete />}
												color={'red.400'}
												isDisabled={!selectedTemplate.id}
												onClick={() => removeTemplate(selectedTemplate.id)}
											/>
										</HStack>

										<TemplateNameInputDialog
											isOpen={isNameInputOpen}
											onClose={closeNameInput}
											onConfirm={(name) => {
												if (!poll.title || poll.options.length === 0) return;
												addToTemplate({ name, poll });
												closeNameInput();
											}}
										/>
									</Flex>
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
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default PollInputDialog;
