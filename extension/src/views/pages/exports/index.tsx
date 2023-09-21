import { CheckIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Image,
    Select,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { EXPORT_GREEN, EXPORT_WHITE } from "../../../assets/Images";
import CheckButton from "./components/checkButton";

const Exports = () => {
    const [all, setAll] = useState(false);
    const [saved, setSaved] = useState(false);
    const [unsaved, setUnsaved] = useState(false);
    const [group, setGroup] = useState(false);
    const [label, setLabel] = useState(false);
    return (
        <Flex direction={"column"} gap={"0.5rem"}>
            <Flex alignItems="center" gap={"0.5rem"} mt={"1.5rem"}>
                <Image src={EXPORT_GREEN} width={4} alt="" />
                <Text color="white" fontSize="md">
                    Exports
                </Text>
            </Flex>
            <Box
                backgroundColor="#535353"
                p={"0.5rem"}
                borderRadius={"20px"}
                mb={"1.5rem"}
            >
                <Flex flexDirection={"column"} gap={"0.25rem"} width={"full"}>
                    <CheckButton
                        label="All Chat Contacts"
                        value={all}
                        setValue={setAll}
                    />
                    <CheckButton
                        label="All Saved Contacts"
                        value={saved}
                        setValue={setSaved}
                    />
                    <CheckButton
                        label="All Unsaved Contacts"
                        value={unsaved}
                        setValue={setUnsaved}
                    />
                    <Flex gap={6} width={"full"}>
                        <IconButton
                            isRound={true}
                            variant="solid"
                            aria-label="Done"
                            size="xs"
                            icon={group ? <CheckIcon color={"white"} /> : <></>}
                            onClick={() => {
                                setGroup(!group);
                            }}
                            backgroundColor={group ? "green.500" : "#252525"}
                            _hover={{ backgroundColor: "green.600" }}
                        />
                        <Box width={"full"}>
                            <Text color="white" fontSize="sm" pb={3}>
                                Group Contacts
                            </Text>
                            <Select
                                size="sm"
                                width={"full"}
                                background={"#252525"}
                                color={"white"}
                                border={"none"}
                                borderRadius={"10px"}
                            >
                                <option
                                    style={{
                                        backgroundColor: "#252525",
                                        height: "30px",
                                    }}
                                >
                                    test1
                                </option>
                                <option
                                    style={{
                                        backgroundColor: "#252525",
                                        height: "30px",
                                    }}
                                >
                                    test1
                                </option>
                                <option
                                    style={{
                                        backgroundColor: "#252525",
                                        height: "30px",
                                    }}
                                >
                                    test1
                                </option>
                                <option
                                    style={{
                                        backgroundColor: "#252525",
                                        height: "30px",
                                    }}
                                >
                                    test1
                                </option>
                            </Select>
                        </Box>
                    </Flex>
                    <Flex gap={6} width={"full"}>
                        <IconButton
                            isRound={true}
                            variant="solid"
                            aria-label="Done"
                            size="xs"
                            icon={label ? <CheckIcon color={"white"} /> : <></>}
                            onClick={() => {
                                setLabel(!label);
                            }}
                            backgroundColor={label ? "green.500" : "#252525"}
                            _hover={{ backgroundColor: "green.600" }}
                        />
                        <Box width={"full"}>
                            <Text color="white" fontSize="sm" pb={3}>
                                Labels
                            </Text>
                            <Select
                                size="sm"
                                width={"full"}
                                background={"#252525"}
                                color={"white"}
                                border={"none"}
                                borderRadius={"10px"}
                            >
                                <option>test1</option>
                            </Select>
                        </Box>
                    </Flex>
                </Flex>
            </Box>
            <Button bgColor={"#4CB072"}>
                <Flex>
                    <Image src={EXPORT_WHITE} width={4} alt="" mr={"0.5rem"} />
                    <Text color={"white"}>Export as</Text>
                </Flex>
            </Button>
        </Flex>
    );
};

export default Exports;
