import { Tag, Wrap, WrapItem, WrapProps } from '@chakra-ui/react';

interface VariablesProps extends WrapProps {
	data: string[];
	onVariableSelect: (text: string) => void;
}

export default function Variables({ data, onVariableSelect, ...props }: VariablesProps) {
	return (
		<Wrap spacing={2} {...props}>
			{data.map((header, index) => (
				<WrapItem key={index}>
					<Tag
						colorScheme='gray'
						size={'md'}
						_hover={{ cursor: 'pointer', bgColor: 'gray.300' }}
						onClick={() => onVariableSelect(`{{${header}}}`)}
					>
						{`{{${header}}}`}
					</Tag>
				</WrapItem>
			))}
		</Wrap>
	);
}
