import { QuestionOutlineIcon } from '@chakra-ui/icons';
import {
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverTrigger,
} from '@chakra-ui/react';

export default function Info({ children }: { children: React.ReactNode }) {
	return (
		<Popover>
			<PopoverTrigger>
				<QuestionOutlineIcon ml={'0.5rem'} />
			</PopoverTrigger>
			<PopoverContent>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody textAlign={'center'}>{children}</PopoverBody>
			</PopoverContent>
		</Popover>
	);
}
