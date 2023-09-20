import { CheckIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";

type CheckButtonType = {
    label: string;
    value: boolean;
    setValue: (e: boolean) => void;
};

const CheckButton = ({ label, setValue, value }: CheckButtonType) => {
    return (
        <Flex gap={4}>
            <IconButton
                isRound={true}
                variant="solid"
                aria-label="Done"
                size="xs"
                icon={value ? <CheckIcon /> : <></>}
                onClick={() => {
                    setValue(!value);
                }}
            />
            <Text fontSize="sm">{label}</Text>
        </Flex>
    );
};

export default CheckButton;
