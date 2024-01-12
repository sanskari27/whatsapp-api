import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Button, Image, Text, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NETWORK_ERROR } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { recheckNetwork, useNetwork } from '../../../hooks/useNetwork';
import { useTheme } from '../../../hooks/useTheme';

const NetworkError = () => {
    const status = useNetwork();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        if (status === 'NO-NETWORK') {
            navigate(NAVIGATION.NETWORK_ERROR);
        } else {
            navigate(NAVIGATION.WELCOME);
        }
    }, [status, navigate]);

    return (
        <VStack width="full" py={'1rem'} px={'1.5rem'}>
            <Box
                zIndex={'1'}
                width="full"
                // height="250px"
                display="flex"
                gap={'1rem'}
                justifyContent={'center'}
                alignItems="center"
                position="relative"
                marginTop={'150px'}
            >
                <Image
                    src={NETWORK_ERROR}
                    className="filter-none"
                    width={'40%'}
                />
            </Box>
            <Text
                className="text-black dark:text-white"
                fontSize={'large'}
                fontWeight={'medium'}
                textAlign={'center'}
            >
                Unable to connect to Servers
            </Text>

            <Button
                marginX={'auto'}
                className="text-gray-700 dark:text-gray-300"
                fontWeight={'medium'}
                fontSize={'large'}
                textAlign={'center'}
                cursor={'pointer'}
                onClick={recheckNetwork}
                textColor={theme === 'dark' ? 'white' : 'black'}
            >
                <RepeatIcon mr={1} />
                refresh
            </Button>
        </VStack>
    );
};
export default NetworkError;