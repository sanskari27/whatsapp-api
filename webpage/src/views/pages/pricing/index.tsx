import {
    Box,
    Flex,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { useOutlet } from "react-router-dom";
import { THEME } from "../../../utils/const";
import PageWrapper from "../../components/pageWrapper";
import Monthly from "./components/MonthlyPlans";
import YearlyPlan from "./components/YearlyPlan";

const PricePage = () => {
    const outlet = useOutlet();

    return (
        <PageWrapper>
            {outlet ? (
                outlet
            ) : (
                <Flex direction={"column"} pt={"2rem"}>
                    <Text
                        fontWeight={"medium"}
                        fontSize={"2xl"}
                        textAlign={"center"}
                    >
                        Choose Your{" "}
                        <Box as="span" color={THEME.THEME_GREEN}>
                            Right Plan!
                        </Box>
                    </Text>
                    <Text
                        alignSelf={"center"}
                        textAlign={"center"}
                        width={"90vw"}
                        maxWidth={"600px"}
                        fontSize={"lg"}
                        py={"2rem"}
                    >
                        Select from best plans, ensuring a perfect match. Need
                        more or less? Customize your subscription for a seamless
                        fit!
                    </Text>
                    <Tabs
                        variant="soft-rounded"
                        colorScheme="green"
                        align="center"
                    >
                        <TabList
                            backgroundColor={"#E9E9E9"}
                            width={"fit-content"}
                            rounded={"full"}
                            p={"5px"}
                        >
                            <Tab
                                _selected={{
                                    backgroundColor: THEME.THEME_GREEN,
                                    textColor: "white",
                                }}
                                textColor={"#8C8C8C"}
                                width={"150px"}
                            >
                                Monthly
                            </Tab>
                            <Tab
                                _selected={{
                                    backgroundColor: THEME.THEME_GREEN,
                                    textColor: "white",
                                }}
                                textColor={"#8C8C8C"}
                                width={"150px"}
                            >
                                Yearly
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel p={0}>
                                <Monthly />
                            </TabPanel>
                            <TabPanel p={0}>
                                <YearlyPlan />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Flex>
            )}
        </PageWrapper>
    );
};
export default PricePage;
