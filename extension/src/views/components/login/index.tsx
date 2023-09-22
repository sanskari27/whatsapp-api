import { Image, Modal, ModalBody, ModalContent, ModalOverlay, Text } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type LoginHandle = {
	open: () => void;
	close: () => void;
};

type Props = {
	qr: string;
};

const LoginModal = forwardRef<LoginHandle, Props>(({ qr }: Props, ref) => {
	const [isOpen, setOpen] = useState(false);
	const onClose = () => setOpen(false);

	useImperativeHandle(ref, () => ({
		open: () => {
			setOpen(true);
		},
		close: () => {
			setOpen(false);
		},
	}));

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent bg={'transparent'} textColor='black'>
				<ModalBody
					bg={'white'}
					textAlign='center'
					width='270px'
					height='270px'
					marginX={'auto'}
					rounded={'lg'}
				>
					<Image src={qr} width={'200px'} height={'200px'} rounded={'lg'} marginX={'auto'} />
					<Text fontSize={'sm'} className='text-gray-300 dark:text-gray-700'>
						Scan the QR code to Enable the feature
					</Text>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
});

export default LoginModal;
