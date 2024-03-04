import { AddIcon, EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	HStack,
	Heading,
	IconButton,
	Select,
	Text,
	Textarea,
	TextareaProps,
	useDisclosure,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import useTemplate from '../../../../hooks/useTemplate';
import { StoreNames, StoreState } from '../../../../store';
import {
	setAttachments,
	setContactCards,
	setMessage,
	setNurturing,
	setPolls,
} from '../../../../store/reducers/BotReducers';
import AddOns from '../../../components/add-ons';
import TemplateNameInputDialog from '../../../components/template-name-input';
import Variables from '../../../components/variables';

type Props = {
	textAreaProps?: TextareaProps;
};

export default function MessageContent(props: Props) {
	const dispatch = useDispatch();

	const [selectedTemplate, setSelectedTemplate] = useState({
		id: '',
		name: '',
	});

	const messageRef = useRef(0);
	const {
		templates,
		add: addToTemplate,
		addingTemplate,
		update: updateTemplate,
		remove: removeTemplate,
	} = useTemplate('message');

	const {
		isOpen: isNameInputOpen,
		onOpen: openNameInput,
		onClose: closeNameInput,
	} = useDisclosure();

	const {
		details,
		ui: { messageError },
	} = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);

	const insertVariablesToMessage = (variable: string) => {
		dispatch(
			setMessage(
				details.message.substring(0, messageRef.current) +
					variable +
					details.message.substring(messageRef.current ?? 0, details.message.length)
			)
		);
	};

	return (
		<Flex direction={'column'} flex={1} gap={'0.5rem'}>
			<Heading fontSize={'lg'} color={Colors.PRIMARY_DARK}>
				Message Content
			</Heading>
			<Box justifyContent={'space-between'}>
				<Flex gap={3} alignItems={'center'}>
					<Select
						bgColor={Colors.ACCENT_LIGHT}
						color={Colors.ACCENT_DARK}
						border={'none'}
						onChange={(e) => {
							dispatch(setMessage(e.target.value));
							setSelectedTemplate({
								id: e.target[e.target.selectedIndex].getAttribute('data-id') ?? '',
								name: e.target[e.target.selectedIndex].getAttribute('data-name') ?? '',
							});
						}}
					>
						<option
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
							value={''}
						>
							Select template!
						</option>
						{(templates ?? []).map(({ name, message, id }, index) => (
							<option
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
								value={message}
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
								if (!details.message) return;
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
									message: details.message,
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
				</Flex>
			</Box>
			<FormControl isInvalid={!!messageError}>
				<Textarea
					variant={'unstyled'}
					width={'full'}
					minHeight={'160px'}
					size={'sm'}
					rounded={'md'}
					paddingX={'1rem'}
					paddingY={'0.5rem'}
					placeholder={'Type your message here. \nex. You are invited to join fan-fest'}
					border={messageError ? '1px red solid' : 'none'}
					bgColor={Colors.ACCENT_LIGHT}
					color={Colors.PRIMARY_DARK}
					_placeholder={{
						opacity: messageError ? 0.6 : 0.7,
						color: messageError ? 'red' : Colors.ACCENT_DARK,
					}}
					_focus={{ border: 'none', outline: 'none' }}
					value={details.message ?? ''}
					onMouseUp={(e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
						if (e.target instanceof HTMLTextAreaElement) {
							messageRef.current = e.target.selectionStart;
						}
					}}
					onChange={(e) => {
						messageRef.current = e.target.selectionStart;
						dispatch(setMessage(e.target.value));
					}}
					{...props.textAreaProps}
				/>
			</FormControl>
			{messageError && (
				<FormErrorMessage>Message, attachment, contact card or poll is required </FormErrorMessage>
			)}

			<Flex gap={'1rem'}>
				<Text className='text-primary-dark'>Variables: </Text>
				<Box>
					<Variables data={['public_name']} onVariableSelect={insertVariablesToMessage} />
				</Box>
			</Flex>
			<TemplateNameInputDialog
				isOpen={isNameInputOpen}
				onClose={closeNameInput}
				onConfirm={(name) => {
					if (!details.message) return;
					addToTemplate({ name, message: details.message });
					closeNameInput();
				}}
			/>

			<AddOns
				width={'full'}
				attachments={details.attachments}
				shared_contact_cards={details.shared_contact_cards}
				polls={details.polls}
				nurturing={details.nurturing}
				onAttachmentsSelected={(ids) => dispatch(setAttachments(ids))}
				onContactsSelected={(ids) => dispatch(setContactCards(ids))}
				onPollsSelected={(ids) => dispatch(setPolls(ids))}
				onLeadNurturingSelected={(nurturing) => dispatch(setNurturing(nurturing))}
			/>
		</Flex>
	);
}
