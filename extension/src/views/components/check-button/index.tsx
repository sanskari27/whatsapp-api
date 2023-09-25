import { CheckIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { isDisabled } from '@testing-library/user-event/dist/utils';

type CheckButtonType = {
	name: string;
	label: string;
	value: boolean;
	onChange: ({ name, value }: { name: string; value: boolean }) => void;
	isDisabled?: boolean;
};

const CheckButton = ({ name, label, onChange, value, isDisabled = false }: CheckButtonType) => {
	const handleChange = (e: boolean) => {
		onChange({
			name: name,
			value: e,
		});
	};

	return (
		<Flex gap={6} alignItems={'center'}>
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
					value ? '!bg-[#4CB072]' : '!bg-[#A6A6A6] dark:!bg-[#252525]'
				} hover:!bg-green-700`}
			/>
			<Text className='text-black dark:text-white' fontSize='sm'>
				{label}
			</Text>
		</Flex>
	);
};

export default CheckButton;
