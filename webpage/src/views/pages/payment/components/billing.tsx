import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    HStack,
    Input,
    Text,
} from "@chakra-ui/react";
import { THEME } from "../../../../utils/const";

type BillingProps = {
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    error: {
        street: string;
        city: string;
        district: string;
        state: string;
        pincode: string;
        country: string;
    };
    handleChangeBillingAddress: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    handleBack: () => void;
};

const Billing = ({
    city,
    country,
    district,
    pincode,
    state,
    street,
    error,
    handleChangeBillingAddress,
    handleBack,
}: BillingProps) => {
    return (
        <FormControl
            isInvalid={
                !!error.city ||
                !!error.country ||
                !!error.district ||
                !!error.pincode ||
                !!error.state ||
                !!error.street
            }
        >
            <Text
                fontSize={"xl"}
                fontWeight={"medium"}
                pt={"1rem"}
                textAlign={"center"}
            >
                Personal Details
            </Text>
            <Text pt={"1rem"}>Address Line 1</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter You Address"}
                isInvalid={!!error.street}
                value={street}
                onChange={handleChangeBillingAddress}
                name="street"
                mb={"1rem"}
            />
            <Text>Address Line 2</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter Your Phone Number"}
                isInvalid={!!error.city}
                value={city}
                onChange={handleChangeBillingAddress}
                name="city"
                mb={"1rem"}
                type="tel"
            />
            <HStack width={"full"}>
                <Box width={"full"}>
                    <Text>Pincode</Text>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter Pincode"}
                        isInvalid={!!error.pincode}
                        value={pincode}
                        onChange={handleChangeBillingAddress}
                        name="pincode"
                        mb={"1rem"}
                    />
                </Box>
                <Box width={"full"}>
                    <Text>District</Text>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter City"}
                        isInvalid={!!error.district}
                        value={district}
                        onChange={handleChangeBillingAddress}
                        name="district"
                        mb={"1rem"}
                        disabled
                    />
                </Box>
            </HStack>
            <HStack>
                <Box width={"full"}>
                    <Text>State</Text>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter State"}
                        isInvalid={!!error.state}
                        value={state}
                        onChange={handleChangeBillingAddress}
                        name="state"
                        mb={"1rem"}
                        disabled
                    />
                </Box>
                <Box width={"full"}>
                    <Text>Country</Text>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter country"}
                        isInvalid={!!error.country}
                        value={country}
                        onChange={handleChangeBillingAddress}
                        name="country"
                        mb={"1rem"}
                        disabled
                    />
                </Box>
            </HStack>
            <FormErrorMessage>{`${error.city} ${error.country} ${error.district} ${error.pincode} ${error.state} ${error.street} `}</FormErrorMessage>
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
                    // onClick={handleNext}
                >
                    Pay
                </Button>
            </HStack>
        </FormControl>
    );
};
export default Billing;
