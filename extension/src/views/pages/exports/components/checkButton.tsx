import { CheckIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";

type CheckButtonType = {
    label: string;
    value: boolean;
    setValue: (e: boolean) => void;
};

const CheckButton = ({ label, setValue, value }: CheckButtonType) => {
    return (
        <Flex gap={6}>
            <IconButton
                isRound={true}
                variant="solid"
                aria-label="Done"
                size="xs"
                icon={value ? <CheckIcon color="white" /> : <></>}
                backgroundColor={value ? "green.500" : "#252525"}
                onClick={() => {
                    setValue(!value);
                }}
                _hover={{ backgroundColor: "green.600" }}
            />
            <Text color="white" fontSize="sm">
                {label}
            </Text>
        </Flex>
    );
};

export default CheckButton;
