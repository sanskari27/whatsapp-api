import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Input,
	Text,
} from '@chakra-ui/react';
import React, { RefObject, forwardRef, useImperativeHandle, useState } from 'react';
import { useTheme } from '../../../../hooks/useTheme';

export type ExtendSubscriptionDialogHandle = {
	close: () => void;
	open: (id?: string) => void;
};

type Props = {
	onConfirm: (id: string, month: number) => void;
};

const ExtendSubscriptionDialog = forwardRef<ExtendSubscriptionDialogHandle, Props>(
	({ onConfirm }: Props, ref) => {
		const theme = useTheme();
		const [isOpen, setOpen] = useState(false);
		const [id, setId] = useState('');
		const [months, setMonths] = useState(0);
		const onClose = () => setOpen(false);
		const handleDelete = () => {
			onConfirm(id, Number(months));
			onClose();
		};

		useImperativeHandle(ref, () => ({
			close: () => {
				setOpen(false);
			},
			open: (id: string = '') => {
				setId(id);
				setMonths(0);
				setOpen(true);
			},
		}));

		const cancelRef = React.useRef() as RefObject<HTMLButtonElement>;

		return (
			<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
				<AlertDialogOverlay>
					<AlertDialogContent
						backgroundColor={theme === 'dark' ? '#252525' : 'white'}
						textColor={theme === 'dark' ? 'white' : 'black'}
					>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Extend Subscription
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>Are you sure? You can't undo this action afterwards.</Text>
							<Input
								mt={'1rem'}
								variant='outline'
								placeholder={`eg. 1 or 12...`}
								value={months.toString()}
								onChange={(e) => setMonths(Number(e.target.value))}
							/>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button colorScheme='green' onClick={handleDelete} isDisabled={months === 0} ml={3}>
								Extend
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		);
	}
);

export default ExtendSubscriptionDialog;
