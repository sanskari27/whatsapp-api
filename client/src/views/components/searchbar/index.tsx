import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import { Colors } from '../../../config/const';

export default function SearchBar({
	text,
	onTextChange,
	filterComponent,
}: {
	text: string;
	onTextChange: (text: string) => void;
	filterComponent?: React.ReactElement;
}) {
	return (
		<InputGroup
			variant={'outline'}
			width={'full'}
			bgColor={Colors.ACCENT_LIGHT}
			borderColor={Colors.ACCENT_DARK}
			shadow={'md'}
			rounded={'lg'}
		>
			<InputLeftElement pointerEvents='none'>
				<SearchIcon color={Colors.ACCENT_DARK} />
			</InputLeftElement>
			<Input
				placeholder='Search here...'
				value={text}
				onChange={(e) => onTextChange(e.target.value)}
				borderRadius={'5px'}
				focusBorderColor={Colors.ACCENT_DARK}
				color={'black'}
				rounded={'lg'}
				_placeholder={{ color: Colors.ACCENT_DARK }}
			/>
			{filterComponent && <InputRightElement>{filterComponent}</InputRightElement>}
		</InputGroup>
	);
}
