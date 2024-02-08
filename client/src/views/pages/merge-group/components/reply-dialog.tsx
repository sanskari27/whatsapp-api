import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import UserService from '../../../../services/user.service';

type GroupMergeProps = {
	onClose: () => void;
	isOpen: boolean;
};

const ReplyDialog = ({ onClose, isOpen }: GroupMergeProps) => {
	const [text, setText] = useState('');

	useEffect(() => {
		UserService.getUserDetails().then(({ group_reply_message }) => setText(group_reply_message));
	}, []);

	const handleSave = () => {
		UserService.setGroupReplyMessage(text);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'2xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>One Time Reply</ModalHeader>
				<ModalBody>
					<Textarea
						width={'full'}
						minHeight={'80px'}
						size={'sm'}
						rounded={'md'}
						placeholder={'eg. Hello there!'}
						border={'none'}
						className='text-black !bg-[#ECECEC] '
						_placeholder={{
							opacity: 0.4,
							color: 'inherit',
						}}
						_focus={{ border: 'none', outline: 'none' }}
						value={text ?? ''}
						onChange={(e) => setText(e.target.value)}
					/>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='red' mr={3} onClick={onClose}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={handleSave}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ReplyDialog;
