import { Input, Select, Textarea } from '@chakra-ui/react';
import { Colors } from '../../../../config/const';
import Each from '../../../../utils/Each';

export function SelectElement({
	options,
	value,
	onChangeText,
	size = 'md',
}: {
	options: { title: string; value: string }[];
	value: string;
	onChangeText: (text: string) => void;
	size?: string;
}) {
	return (
		<Select
			bgColor={Colors.ACCENT_LIGHT}
			color={Colors.ACCENT_DARK}
			border={'none'}
			value={value}
			rounded={'md'}
			size={size}
			onChange={(e) => onChangeText(e.target.value)}
		>
			<Each
				items={options}
				render={(option, index) => (
					<option key={index} value={option.value}>
						{option.title}
					</option>
				)}
			/>
		</Select>
	);
}

export function NumberInput({
	value,
	onChangeText,
}: {
	value: number;
	onChangeText: (value: number) => void;
}) {
	return (
		<Input
			type='number'
			size={'md'}
			rounded={'md'}
			value={value}
			onChange={(e) => onChangeText(Number(e.target.value))}
			variant='unstyled'
			bgColor={Colors.ACCENT_LIGHT}
			padding={'0.5rem'}
			min={1}
		/>
	);
}

export function TextInput({
	value,
	onChangeText,
	placeholder,
}: {
	value: string;
	placeholder: string;
	onChangeText: (value: string) => void;
}) {
	return (
		<Input
			type='text'
			placeholder={placeholder}
			size={'md'}
			rounded={'md'}
			border={'none'}
			color={Colors.PRIMARY_DARK}
			bgColor={Colors.ACCENT_LIGHT}
			borderColor={Colors.ACCENT_DARK}
			borderWidth={'1px'}
			value={value}
			onChange={(e) => onChangeText(e.target.value)}
			_placeholder={{
				opacity: 0.7,
				color: Colors.ACCENT_DARK,
			}}
		/>
	);
}

export function TextAreaElement({
	value,
	onChange,
	isInvalid,
	placeholder,
	minHeight = '80px',
}: {
	placeholder: string;
	value: string;
	onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
	isInvalid: boolean;
	minHeight?: string;
}) {
	return (
		<Textarea
			width={'full'}
			minHeight={minHeight}
			isInvalid={isInvalid}
			placeholder={placeholder}
			border={'none'}
			color={Colors.PRIMARY_DARK}
			bgColor={Colors.ACCENT_LIGHT}
			borderColor={Colors.ACCENT_DARK}
			borderWidth={'1px'}
			_placeholder={{
				opacity: 0.7,
				color: Colors.ACCENT_DARK,
			}}
			_focus={{ border: 'none', outline: 'none' }}
			value={value}
			onChange={onChange}
		/>
	);
}
