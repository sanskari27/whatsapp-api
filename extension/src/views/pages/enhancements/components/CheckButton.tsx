import { CheckIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';

type CheckButtonType = {
	name: string;
	label: string;
	value: boolean;
	onChange: ({ name, value }: { name: string; value: boolean }) => void;
};

const CheckButton = ({ name, label, onChange, value }: CheckButtonType) => {
	const handleChange = (e: boolean) => {
		onChange({
			name: name,
			value: e,
		});
	};

	return (
		<Flex gap={6}>
			<IconButton
				isRound={true}
				variant='solid'
				aria-label='Done'
				size='xs'
				icon={value ? <CheckIcon color='white' /> : <></>}
				backgroundColor={value ? 'green.500' : '#252525'}
				onClick={() => {
					handleChange(!value);
				}}
				_hover={{ backgroundColor: 'green.600' }}
			/>
			<Text color='white' fontSize='sm'>
				{label}
			</Text>
		</Flex>
	);
};

export default CheckButton;
