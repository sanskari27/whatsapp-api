import { AddIcon } from '@chakra-ui/icons';
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	IconButton,
	Input,
	Select,
	Tag,
	TagCloseButton,
	TagLabel,
	Text,
	Textarea,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import React, { ChangeEvent, useRef, useState } from 'react';
import { SchedulerDetails } from '..';
import useAttachment from '../../../../hooks/useAttachment';
import useTemplate from '../../../../hooks/useTemplate';

const MessageSection = ({
	details,
	type,
	handleChange,
	error,
	addVariable,
	removeVariable,
	addContact,
	removeContact,
	isHidden,
}: {
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL';
	details: {
		message: string;
		variables: string[];
		shared_contact_cards: string[];
		attachments: string[];
	};
	handleChange: ({
		name,
		value,
	}: {
		name: keyof SchedulerDetails;
		value: string | number | string[] | undefined;
	}) => Promise<void>;
	addVariable: (text: string) => void;
	removeVariable: (text: string) => void;
	addContact: (text: string) => void;
	removeContact: (text: string) => void;
	error: string;
	isHidden: boolean;
}) => {
	const { templates, add: addToTemplate, addingTemplate } = useTemplate();
	const { attachments: allAttachments, add: addAttachment, addingAttachment } = useAttachment();
	const fileInputRef = useRef<HTMLInputElement | null>();
	const [variableName, setVariableName] = useState('');
	const [contact_name, setContactName] = useState('');
	const {
		isOpen: isNameInputOpen,
		onOpen: openNameInput,
		onClose: closeNameInput,
	} = useDisclosure();
	const {
		isOpen: isAttachmentDetailsOpen,
		onOpen: openAttachmentDetailsInput,
		onClose: closeAttachmentDetailsInput,
	} = useDisclosure();

	const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

	const handleAttachmentInput = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files === null) return;
		if (files.length === 0) return;
		if (files[0] === null) return;
		const file = files[0];
		if (fileInputRef.current) fileInputRef.current.value = '';
		setAttachmentFile(file);
		openAttachmentDetailsInput();
	};

	return (
		<FormControl
			isInvalid={!!error}
			display={'flex'}
			flexDirection={'column'}
			gap={2}
			hidden={isHidden}
		>
			<Box justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Select Template
				</Text>
				<Flex gap={3} alignItems={'center'}>
					<Select
						placeholder='Select template!'
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
						border={'none'}
						size={'sm'}
						rounded={'md'}
						onChange={(e) => handleChange({ name: 'message', value: e.target.value })}
					>
						{(templates ?? []).map(({ name, message }, index) => (
							<option value={message} key={index}>
								{name}
							</option>
						))}
					</Select>
					<IconButton
						size={'sm'}
						colorScheme='green'
						aria-label='Add Template'
						rounded={'md'}
						icon={<AddIcon />}
						isLoading={addingTemplate}
						onClick={() => {
							if (!details.message) return;
							openNameInput();
						}}
					/>
					<InputDialog
						isOpen={isNameInputOpen}
						onClose={closeNameInput}
						onConfirm={(name) => {
							if (!details.message) return;
							addToTemplate(name, details.message);
							closeNameInput();
						}}
					/>
				</Flex>
			</Box>
			<Box>
				<Textarea
					width={'full'}
					minHeight={'80px'}
					size={'sm'}
					rounded={'md'}
					placeholder={
						type === 'CSV'
							? 'Type your message here. \nex. Hello {{name}}, you are invited to join fanfest on {{date}}'
							: 'Type your message here. \nex. You are invited to join fanfest'
					}
					border={'none'}
					className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
					_placeholder={{ opacity: 0.4, color: 'inherit' }}
					_focus={{ border: 'none', outline: 'none' }}
					value={details.message ?? ''}
					onChange={(e) => handleChange({ name: 'message', value: e.target.value })}
				/>
			</Box>
			<Box hidden={type !== 'CSV'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Variables
				</Text>
				<Flex gap={3} alignItems={'center'}>
					<Input
						width={'full'}
						placeholder='Enter variable name'
						size={'sm'}
						rounded={'md'}
						border={'none'}
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
						_focus={{ border: 'none', outline: 'none' }}
						value={variableName}
						onChange={(e) => setVariableName(e.target.value)}
					/>
					<IconButton
						size={'sm'}
						colorScheme='green'
						aria-label='Add Template'
						rounded={'md'}
						icon={<AddIcon />}
						onClick={() => {
							if (variableName.length === 0) return;
							addVariable(`{{${variableName}}}`);
							setVariableName('');
						}}
					/>
				</Flex>
			</Box>
			<Box hidden={type !== 'CSV'}>
				{details.variables.map((variable, index) => (
					<Tag
						size={'sm'}
						m={'0.125rem'}
						key={index}
						borderRadius='full'
						variant='solid'
						colorScheme='green'
					>
						<TagLabel>{variable}</TagLabel>
						<TagCloseButton onClick={() => removeVariable(variable)} />
					</Tag>
				))}
			</Box>
			<Box>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Attachments
				</Text>
				<Flex gap={3} alignItems={'center'}>
					<Multiselect
						displayValue='displayValue'
						placeholder={'Select Attachments'}
						onRemove={(selectedList: typeof allAttachments) =>
							handleChange({
								name: 'attachments',
								value: selectedList.map((attachment) => attachment.id),
							})
						}
						onSelect={(selectedList: typeof allAttachments) =>
							handleChange({
								name: 'attachments',
								value: selectedList.map((attachment) => attachment.id),
							})
						}
						showCheckbox={true}
						hideSelectedList={true}
						options={allAttachments.map((item, index) => ({
							...item,
							displayValue: `${index + 1}. ${item.name}`,
						}))}
						style={{
							searchBox: {
								border: 'none',
							},
							inputField: {
								width: '100%',
							},
						}}
						className='!w-[375px]  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none '
					/>
					<IconButton
						size={'sm'}
						colorScheme='green'
						aria-label='Add Template'
						rounded={'md'}
						icon={<AddIcon />}
						onClick={() => {
							document.getElementById('attachment-file-input')?.click();
						}}
						isLoading={addingAttachment}
					/>
				</Flex>
				<AttachmentDetailsInputDialog
					isOpen={isAttachmentDetailsOpen}
					onClose={() => {
						closeAttachmentDetailsInput();
						setAttachmentFile(null);
					}}
					onConfirm={(name: string, caption: string) => {
						if (!attachmentFile || !name) return;
						addAttachment(name, caption, attachmentFile);
						closeAttachmentDetailsInput();
					}}
				/>
				<input
					type='file'
					name='attachment-file-input'
					id='attachment-file-input'
					className='invisible h-[1px] w-[1px] absolute'
					multiple={false}
					ref={(ref) => (fileInputRef.current = ref)}
					onInput={handleAttachmentInput}
				/>
			</Box>

			<Box hidden={type !== 'CSV'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Contact Cards
				</Text>
				<Flex gap={3} alignItems={'center'}>
					<Input
						width={'full'}
						placeholder='91 + contact number'
						size={'sm'}
						rounded={'md'}
						border={'none'}
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
						_focus={{ border: 'none', outline: 'none' }}
						value={contact_name}
						onChange={(e) => setContactName(e.target.value)}
					/>
					<IconButton
						size={'sm'}
						colorScheme='green'
						aria-label='Add Template'
						rounded={'md'}
						icon={<AddIcon />}
						onClick={() => {
							if (variableName.length === 0) return;
							addContact(contact_name);
							setContactName('');
						}}
					/>
				</Flex>
			</Box>
			<Box hidden={type !== 'CSV'}>
				{details.shared_contact_cards.map((contact, index) => (
					<Tag
						size={'sm'}
						m={'0.125rem'}
						key={index}
						borderRadius='full'
						variant='solid'
						colorScheme='green'
					>
						<TagLabel>{contact}</TagLabel>
						<TagCloseButton onClick={() => removeContact(contact)} />
					</Tag>
				))}
			</Box>
			{error && (
				<FormErrorMessage mt={-2} textAlign={'center'}>
					{error}
				</FormErrorMessage>
			)}
		</FormControl>
	);
};

const InputDialog = ({
	isOpen,
	onConfirm,
	onClose,
}: {
	onClose: () => void;
	onConfirm: (text: string) => void;
	isOpen: boolean;
}) => {
	const [name, setName] = React.useState('');
	const cancelRef = React.useRef<any>();
	return (
		<AlertDialog
			motionPreset='slideInBottom'
			leastDestructiveRef={cancelRef}
			onClose={onClose}
			isOpen={isOpen}
			isCentered
		>
			<AlertDialogOverlay />

			<AlertDialogContent width={'80%'}>
				<AlertDialogHeader fontSize={'sm'}>Assign a name.</AlertDialogHeader>
				<AlertDialogCloseButton />
				<AlertDialogBody>
					<Input
						width={'full'}
						placeholder={'template name...'}
						border={'none'}
						className='text-black !bg-[#ECECEC] '
						_placeholder={{ opacity: 0.4, color: 'inherit' }}
						_focus={{ border: 'none', outline: 'none' }}
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</AlertDialogBody>
				<AlertDialogFooter>
					<Button ref={cancelRef} colorScheme='red' onClick={onClose} size={'sm'}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={() => onConfirm(name)} ml={3} size={'sm'}>
						Save
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const AttachmentDetailsInputDialog = ({
	isOpen,
	onConfirm,
	onClose,
}: {
	onClose: () => void;
	onConfirm: (name: string, caption: string) => void;
	isOpen: boolean;
}) => {
	const [name, setName] = React.useState('');
	const [caption, setCaption] = React.useState('');
	const cancelRef = React.useRef<any>();
	return (
		<AlertDialog
			motionPreset='slideInBottom'
			leastDestructiveRef={cancelRef}
			onClose={onClose}
			isOpen={isOpen}
			isCentered
		>
			<AlertDialogOverlay />

			<AlertDialogContent width={'80%'}>
				<AlertDialogHeader pb={0} fontSize={'sm'}>
					Assign a name & caption.
				</AlertDialogHeader>
				<AlertDialogCloseButton />
				<AlertDialogBody>
					<Flex direction={'column'} gap={2}>
						<Input
							width={'full'}
							placeholder={'attachment name....'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{ opacity: 0.4, color: 'inherit' }}
							_focus={{ border: 'none', outline: 'none' }}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<Input
							width={'full'}
							placeholder={'caption (optional)'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{ opacity: 0.4, color: 'inherit' }}
							_focus={{ border: 'none', outline: 'none' }}
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
						/>
					</Flex>
				</AlertDialogBody>
				<AlertDialogFooter pt={0}>
					<Button ref={cancelRef} colorScheme='red' onClick={onClose} size={'sm'}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={() => onConfirm(name, caption)} ml={3} size={'sm'}>
						Save
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default MessageSection;
