import { Box, Flex, VStack, Text } from '@chakra-ui/react';
import { CONFIRM_BG } from '../../assets/Images';
import Navbar from '../components/navbar';
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import Footer from '../components/footer';


export default function PaymentConfirm() {
    const { width, height } = useWindowSize()
    return (
        <Flex
            direction='column'
            backgroundRepeat={'no-repeat'}
            backgroundPosition={'center'}
            backgroundSize={'cover'}
            backgroundImage={`url(${CONFIRM_BG})`}
            minHeight={height}
            minWidth={width}
            className=''
        >
            <Navbar />
            <Confetti
                width={width}
                height={height}
            />
            <Flex alignItems="center" justifyContent="center" my='auto'>
                <VStack
                    spacing={4}
                >
                    <Flex bg='#4CB07266' alignItems='center' py='0.7rem' px='2.5rem' rounded='lg'>
                        <InfoOutlineIcon mr='10px' color='#235C39'/> <Text color='#235C39' className='text-sm md:text-lg' >Your Transaction has been completed</Text>
                    </Flex>
                    <Flex>
                        <Text fontWeight='bold'>Open our extension to see the changes!!</Text>
                    </Flex>
                </VStack>
            </Flex>
            <Footer/>
        </Flex>
    );
}