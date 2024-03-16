import { Button, HStack, StackProps } from '@chakra-ui/react';
import { useRef } from 'react';
import { Poll } from '../../../store/types/PollState';
import PollInputDialog, { PollInputDialogHandle } from '../polls-input-dialog';
import AttachmentSelectorDialog, {
	AttachmentDialogHandle,
} from '../selector-dialog/AttachmentSelectorDialog';
import ContactSelectorDialog, {
	ContactDialogHandle,
} from '../selector-dialog/ContactSelectorDialog';
import InputLeadsNurturingDialog, {
	InputLeadsNurturingDialogHandle,
} from './InputLeadsNurturingDialog';

type Props = {
	attachments: string[];
	contacts: string[];
	polls: Poll[];
	nurturing?: {
		message: string;
		after: number;
		startAt: string;
		endAt: string;
		contacts: string[];
		attachments: string[];
		polls: Poll[];
	}[];
	onAttachmentsSelected: (ids: string[]) => void;
	onContactsSelected: (ids: string[]) => void;
	onPollsSelected: (ids: Poll[]) => void;
	onLeadNurturingSelected?: (
		nurturing: {
			message: string;
			after: number;
			startAt: string;
			endAt: string;
			contacts: string[];
			attachments: string[];
			polls: Poll[];
		}[]
	) => void;
} & StackProps;

const DEFAULT_POLL = [
	{
		title: '',
		options: ['', ''],
		isMultiSelect: false,
	},
];
export default function AddOns({
	attachments,
	polls,
	contacts,
	onAttachmentsSelected,
	onContactsSelected,
	onPollsSelected,
	nurturing,
	onLeadNurturingSelected,
	...props
}: Props) {
	const attachmentRef = useRef<AttachmentDialogHandle>(null);
	const contactRef = useRef<ContactDialogHandle>(null);
	const pollInputRef = useRef<PollInputDialogHandle>(null);
	const leadsNurturingRef = useRef<InputLeadsNurturingDialogHandle>(null);

	return (
		<>
			<HStack {...props}>
				<Button
					width={'full'}
					variant={'outline'}
					colorScheme='green'
					onClick={() => attachmentRef.current?.open(attachments)}
				>
					Attachments ({attachments.length})
				</Button>
				<Button
					width={'full'}
					variant={'outline'}
					colorScheme='green'
					onClick={() => contactRef.current?.open(contacts)}
				>
					Contacts ({contacts.length})
				</Button>
				<Button
					width={'full'}
					variant={'outline'}
					colorScheme='green'
					onClick={() => pollInputRef.current?.open(polls.length === 0 ? DEFAULT_POLL : polls)}
				>
					Polls ({polls.length})
				</Button>
				{nurturing && (
					<Button
						width={'full'}
						variant={'outline'}
						colorScheme='green'
						onClick={() => leadsNurturingRef.current?.open(nurturing)}
					>
						Nurturing ({nurturing.length})
					</Button>
				)}
			</HStack>
			<AttachmentSelectorDialog ref={attachmentRef} onConfirm={onAttachmentsSelected} />
			<ContactSelectorDialog ref={contactRef} onConfirm={onContactsSelected} />
			<PollInputDialog ref={pollInputRef} onConfirm={onPollsSelected} />
			{nurturing && (
				<InputLeadsNurturingDialog ref={leadsNurturingRef} onConfirm={onLeadNurturingSelected!} />
			)}
		</>
	);
}
