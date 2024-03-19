import { Button, HStack, StackProps } from '@chakra-ui/react';
import { useRef } from 'react';
import { Poll } from '../../../store/types/PollState';
import InputLeadsNurturingDialog, {
	InputLeadsNurturingDialogHandle,
} from '../../pages/bot/components/InputLeadsNurturingDialog';
import PollInputDialog, { PollInputDialogHandle } from '../polls-input-dialog';
import AttachmentSelectorDialog, {
	AttachmentDialogHandle,
} from '../selector-dialog/AttachmentSelectorDialog';
import ContactSelectorDialog, {
	ContactDialogHandle,
} from '../selector-dialog/ContactSelectorDialog';

type Props = {
	attachments: string[];
	shared_contact_cards: string[];
	polls: Poll[];
	nurturing?: {
		message: string;
		after: number;
		start_from: string;
		end_at: string;
		shared_contact_cards: string[];
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
			start_from: string;
			end_at: string;
			shared_contact_cards: string[];
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
	shared_contact_cards,
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
					Attachment ({attachments.length})
				</Button>
				<Button
					width={'full'}
					variant={'outline'}
					colorScheme='green'
					onClick={() => contactRef.current?.open(shared_contact_cards)}
				>
					Contact ({shared_contact_cards.length})
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
						variant={'solid'}
						colorScheme='green'
						onClick={() => leadsNurturingRef.current?.open(nurturing)}
					>
						Add Nurturing ({nurturing.length}) Added
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
