import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    HStack,
    Input,
    InputGroup,
    InputLeftAddon,
    Text,
} from "@chakra-ui/react";
import { THEME } from "../../../../utils/const";
import CountryCodeInput from "../../../components/counrty-code-input";

type WaNumberProps = {
    whatsapp_numbers: { country_code: string; phone_number: string }[];
    updateWhatsappNumber: (
        index: number,
        key: "country_code" | "phone_number",
        value: string
    ) => void;
    plan_details: {
        amount: number;
        user_count: number;
    };
    error: {
        whatsapp_number: string;
    };
    handleBack: () => void;
    handleNext: () => void;
};

const WaNumber = ({
    whatsapp_numbers,
    updateWhatsappNumber,
    plan_details,
    error,
    handleBack,
    handleNext,
}: WaNumberProps) => {
    return (
        <FormControl isInvalid={!!error.whatsapp_number}>
            <Text
                fontSize={"xl"}
                fontWeight={"medium"}
                pt={"1rem"}
                textAlign={"center"}
            >
                Device Numbers
            </Text>
            {whatsapp_numbers.map(({ country_code, phone_number }, index) => (
                <Box key={index}>
                    <Text>Whatsapp Number {index + 1}</Text>
                    <InputGroup pb={"1rem"}>
                        <InputLeftAddon
                            width={"80px"}
                            paddingX={0}
                            children={
                                <CountryCodeInput
                                    value={country_code}
                                    onChange={(text) =>
                                        updateWhatsappNumber(
                                            index,
                                            "country_code",
                                            text
                                        )
                                    }
                                />
                            }
                        />
                        <Input
                            type="tel"
                            backgroundColor={"#E8E8E8"}
                            placeholder={"eg. 1234567890"}
                            value={phone_number}
                            isInvalid={!!error.whatsapp_number}
                            onChange={(e) =>
                                updateWhatsappNumber(
                                    index,
                                    "phone_number",
                                    e.target.value
                                )
                            }
                        />
                    </InputGroup>
                </Box>
            ))}
            <Input
                backgroundColor={"#E8E8E8"}
                mb={"1rem"}
                defaultValue={plan_details.amount}
                disabled
            />
            <FormErrorMessage>{error.whatsapp_number}</FormErrorMessage>
            <HStack>
                <Button
                    backgroundColor={THEME.THEME_GREEN}
                    color={"white"}
                    width={"full"}
                    _hover={{ backgroundColor: "green.500" }}
                    onClick={handleBack}
                >
                    Back
                </Button>
                <Button
                    backgroundColor={THEME.THEME_GREEN}
                    color={"white"}
                    width={"full"}
                    _hover={{ backgroundColor: "green.500" }}
                    onClick={handleNext}
                >
                    Next
                </Button>
            </HStack>
        </FormControl>
    );
};

export default WaNumber;
