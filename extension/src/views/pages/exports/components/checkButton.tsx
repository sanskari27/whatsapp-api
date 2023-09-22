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
                onClick={() => {
                    setValue(!value);
                }}
                className={`${
                    value ? "!bg-[#4CB072]" : "!bg-[#A6A6A6] dark:!bg-[#252525]"
                } hover:!bg-green-700`}
            />
            <Text className="text-black dark:text-white" fontSize="sm">
                {label}
            </Text>
        </Flex>
    );
};

export default CheckButton;
