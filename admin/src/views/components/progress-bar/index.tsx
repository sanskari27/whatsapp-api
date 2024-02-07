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
            <Text>Uploading. . . </Text>
            <Progress
                colorScheme="green"
                hasStripe
                isAnimated
                value={progress}
                width={'100%'}
                zIndex={1000}
            />
        </Box>
    );
});

export default ProgressBar;
