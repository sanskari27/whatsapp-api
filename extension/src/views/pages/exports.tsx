import { CheckIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Image,
    Select,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { CheckButton } from "./compoments";

const Exports = () => {
    const [all, setAll] = useState(false);
    const [saved, setSaved] = useState(false);
    const [unsaved, setUnsaved] = useState(false);
    const [group, setGroup] = useState(false);
    const [label, setLabel] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    return (
        <Flex direction="column" width="400px" paddingTop="50px">
            {isLogin ? (
                <></>
            ) : (
                <VStack width="full">
                    <Box
                        width="100px"
                        height="100px"
                        borderRadius="10px"
                        boxShadow="0px 0px 5px 5px #4CB07266"
                        margin="auto"
                    >
                        <Image></Image>
                    </Box>
                    <Text>Scan The QR Code To</Text>
                    <Text>Enable The Feature</Text>
                </VStack>
            )}
            <Text>Exports</Text>
            <Box>
                <Flex direction="column" gap={3}>
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
                    <Flex gap={4}>
                        <IconButton
                            isRound={true}
                            variant="solid"
                            aria-label="Done"
                            size="xs"
                            icon={group ? <CheckIcon /> : <></>}
                            onClick={() => {
                                setGroup(!group);
                            }}
                        />
                        <Box>
                            <Text size="sm">Group Contacts</Text>
                            <Select size="sm" placeholder="Select the group">
                                <option>test1</option>
                            </Select>
                        </Box>
                    </Flex>
                    <Flex gap={4}>
                        <IconButton
                            isRound={true}
                            variant="solid"
                            aria-label="Done"
                            size="xs"
                            icon={label ? <CheckIcon /> : <></>}
                            onClick={() => {
                                setLabel(!label);
                            }}
                        />
                        <Box>
                            <Text size="sm">Labels</Text>
                            <Select size="sm" placeholder="Select the Labels">
                                <option>test1</option>
                            </Select>
                        </Box>
                    </Flex>
                    <Button>Export</Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default Exports;
