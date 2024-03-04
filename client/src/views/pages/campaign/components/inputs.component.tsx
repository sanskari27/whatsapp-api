import { FormControl, Input, Text } from '@chakra-ui/react';
import { Colors } from '../../../../config/const';

export function DelayInput({
	onChange,
	placeholder,
	value,
	invalid,
}: {
	placeholder: string;
	value: number;
	onChange: (num: number) => void;
	invalid?: boolean;
}) {
	return (
		<FormControl flexGrow={1} isInvalid={invalid}>
			<Text fontSize='sm' color={Colors.PRIMARY_DARK}>
				{placeholder}
			</Text>
			<Input
				width={'full'}
				placeholder='5'
				rounded={'md'}
				border={'none'}
				bgColor={Colors.ACCENT_LIGHT}
				color={invalid ? 'red.400' : Colors.ACCENT_DARK}
				_focus={{
					border: 'none',
					outline: 'none',
				}}
				type='number'
				min={1}
				value={value.toString()}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		</FormControl>
	);
}

export function TimeInput({
	onChange,
	placeholder,
	value,
}: {
	placeholder: string;
	value: string;
	onChange: (text: string) => void;
}) {
	return (
		<FormControl flexGrow={1}>
			<Text fontSize='sm' color={Colors.PRIMARY_DARK}>
				{placeholder}
			</Text>
			<Input
				type='time'
				width={'full'}
				placeholder='00:00'
				rounded={'md'}
				border={'none'}
				bgColor={Colors.ACCENT_LIGHT}
				color={Colors.ACCENT_DARK}
				_focus={{
					border: 'none',
					outline: 'none',
				}}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</FormControl>
	);
}
