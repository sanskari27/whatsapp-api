import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { useTheme } from '../../../hooks/useTheme';

export default function Navbar() {
    const theme = useTheme();
    const navigate = useNavigate();

    const locations =
        location.pathname.length > 1 ? location.pathname.split('/') : ['/'];

    return (
        <Flex
            justifyContent={'space-between'}
            alignItems={'center'}
            position={'fixed'}
            top={0}
            left={'70px'}
            width={'calc(100% - 70px)'}
            height={'calc(50px + 0.75rem)'}
            borderBottomWidth={'thin'}
            borderBottomColor={theme === 'light' ? 'gray.300' : 'gray.500'}
            paddingY={'0.75rem'}
            paddingX={'0.75rem'}
        >
            <Flex alignItems={'center'}>
                <Box>
                    <Breadcrumb
                        fontSize={'lg'}
                        fontWeight="medium"
                        textDecoration={'none'}
                        className="hover:no-underline"
                        color={theme === 'light' ? 'black' : 'gray.200'}
                    >
                        {locations.map((loc, index) => {
                            if (index === 0) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.HOME)
                                            }
                                        >
                                            WhatsLeads
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.EXPORTS.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.EXPORTS)
                                            }
                                        >
                                            Exports
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.SCHEDULER.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.SCHEDULER)
                                            }
                                        >
                                            Scheduler
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.BOT.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.BOT)
                                            }
                                        >
                                            Bot
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.REPORTS.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.REPORTS)
                                            }
                                        >
                                            Reports
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.SETTINGS.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.SETTINGS)
                                            }
                                        >
                                            Settings
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            } else if (
                                loc.includes(NAVIGATION.SHORT.substring(1))
                            ) {
                                return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbLink
                                            as={Box}
                                            textDecoration={'none'}
                                            isCurrentPage={
                                                index === locations.length - 1
                                            }
                                            onClick={() =>
                                                index !==
                                                    locations.length - 1 &&
                                                navigate(NAVIGATION.SHORT)
                                            }
                                        >
                                            Shortner
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            }
                            return null;
                        })}
                    </Breadcrumb>
                </Box>
            </Flex>
        </Flex>
    );
}
