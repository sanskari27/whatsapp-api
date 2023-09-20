import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { NAVIGATION } from "../../consts/consts";

const Navbar = () => {
    const history = useHistory();
    return (
        <Flex direction="column">
            <Flex direction={"row"} justifyContent={"space-between"}>
                <Text>Extension</Text>
                <Box>s</Box>
            </Flex>
            <HStack>
                <Button onClick={() => history.push(NAVIGATION.WELCOME)}>
                    Welcome
                </Button>
                <Button onClick={() => history.push(NAVIGATION.EXPORT)}>
                    Export
                </Button>
                <Button onClick={() => history.push(NAVIGATION.ENHANCEMENT)}>
                    Enhanchment
                </Button>
            </HStack>
        </Flex>
    );
};

export default Navbar;
