import { CheckIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';

type CheckButtonType = {
	name: string;
	label: string;
	value: boolean;
	onChange: ({ name, value }: { name: string; value: boolean }) => void;
	isDisabled?: boolean;
	gap?: number;
	backgroundClassName?: string;
};

const CheckButton = ({
	name,
	label,
	onChange,
	value,
	isDisabled = false,
	gap = 6,
	backgroundClassName = '',
}: CheckButtonType) => {
	const handleChange = (e: boolean) => {
		onChange({
			name: name,
			value: e,
		});
	};

	return (
		<Flex gap={gap} alignItems={'center'}>
			<IconButton
				isRound={true}
				variant='solid'
				aria-label='Done'
				size='xs'
				icon={value ? <CheckIcon color='white' /> : <></>}
				onClick={() => {
					handleChange(!value);
				}}
				isDisabled={isDisabled}
				className={`${
					value ? '!bg-[#4CB072]' : backgroundClassName || '!bg-[#A6A6A6] '
				} hover:!bg-green-700 `}
			/>
			<Text fontSize='sm'>{label}</Text>
		</Flex>
	);
};

export default CheckButton;
