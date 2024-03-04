import { Box, Progress, Text } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type ProgressBarHandle = {
	setProgressValue: (progress: number) => void;
};

const ProgressBar = forwardRef<ProgressBarHandle>((_, ref) => {
	const [progress, setProgress] = useState<number>();

	useImperativeHandle(ref, () => ({
		setProgressValue: (progress: number) => {
			setProgress(progress);
		},
	}));

	return (
		<Box width={'full'} hidden={!progress}>
			<Text className='animate-pulse'>Uploading. . . </Text>
			<Progress
				colorScheme='green'
				hasStripe
				isAnimated
				value={progress}
				width={'full'}
				zIndex={10}
				rounded={'xl'}
			/>
		</Box>
	);
});

export default ProgressBar;
