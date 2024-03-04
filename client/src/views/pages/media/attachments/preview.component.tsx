import { AspectRatio, Image, Progress, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';

export default function Preview({
	data,
	progress,
	onShowPreview,
}: {
	data: {
		url: string;
		type: string;
	} | null;
	progress: number;
	onShowPreview?: () => void;
}) {
	const [show_preview, setShowPreview] = useState(false);
	const {
		ui_config: { load_preview },
	} = useSelector((state: StoreState) => state[StoreNames.USER]);

	if (!data) {
		if (!load_preview && !show_preview) {
			return (
				<Text
					variant={'unstyled'}
					my={'2rem'}
					size='xs'
					color={Colors.PRIMARY_DARK}
					fontSize={'sm'}
					textAlign={'center'}
					textDecoration={'underline'}
					textUnderlineOffset={'0.125rem'}
					cursor={'pointer'}
					onClick={() => {
						setShowPreview(true);
						onShowPreview?.();
					}}
				>
					Load Preview
				</Text>
			);
		}
		return (
			<>
				<Text textAlign={'center'} className='animate-pulse'>
					loading...
				</Text>
				<Progress
					mt={'0.25rem'}
					isIndeterminate={progress === -1}
					value={progress}
					size='xs'
					colorScheme='green'
					rounded={'lg'}
				/>
			</>
		);
	}

	if (data.type === 'image') {
		return <Image src={data.url} aspectRatio={'1/1'} borderRadius='lg' />;
	} else if (data.type === 'video') {
		return (
			<AspectRatio ratio={1 / 1}>
				<video style={{ borderRadius: '0.75rem' }} controls>
					<source src={data.url} type='video/mp4' />
				</video>
			</AspectRatio>
		);
	} else if (data.type === 'PDF') {
		return (
			<AspectRatio ratio={1 / 1}>
				<embed
					src={data.url + '#toolbar=0&navpanes=0&scrollbar=0'}
					type='application/pdf'
					width='100%'
					height='calc(100vh - 90px)'
				/>
			</AspectRatio>
		);
	}
	return (
		<Text textAlign={'center'} color={'red.500'} my={'2rem'}>
			No Preview Available
		</Text>
	);
}
