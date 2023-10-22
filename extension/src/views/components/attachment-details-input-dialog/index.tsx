import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Flex,
	Input,
} from '@chakra-ui/react';
import React from 'react';

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

export default AttachmentDetailsInputDialog;
