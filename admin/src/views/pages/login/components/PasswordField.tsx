import {
	FormControl,
	FormLabel,
	IconButton,
	Input,
	InputGroup,
	InputProps,
	InputRightElement,
	useDisclosure,
	useMergeRefs,
} from '@chakra-ui/react';
import { forwardRef, useRef } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useTheme } from '../../../../hooks/useTheme';

export const PasswordField = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const { isOpen, onToggle } = useDisclosure();
	const inputRef = useRef<HTMLInputElement>(null);
	const theme = useTheme();

	const mergeRef = useMergeRefs(inputRef, ref);
	const onClickReveal = () => {
		onToggle();
		if (inputRef.current) {
			inputRef.current.focus({ preventScroll: true });
		}
	};

	return (
		<FormControl>
			<FormLabel htmlFor='password' color={theme === 'dark' ? 'gray' : 'black'}>
				Password
			</FormLabel>
			<InputGroup>
				<InputRightElement>
					<IconButton
						variant='text'
						aria-label={isOpen ? 'Mask password' : 'Reveal password'}
						icon={isOpen ? <HiEyeOff /> : <HiEye />}
						onClick={onClickReveal}
					/>
				</InputRightElement>
				<Input
					id='password'
					ref={mergeRef}
					name='password'
					type={isOpen ? 'text' : 'password'}
					autoComplete='current-password'
					required
					color={theme === 'dark' ? 'white' : 'black'}
					{...props}
				/>
			</InputGroup>
		</FormControl>
	);
});

PasswordField.displayName = 'PasswordField';
