import {
    Box,
    FormControl,
    FormErrorMessage,
    HStack,
    Input,
    Text,
} from "@chakra-ui/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { validateBillingDetails, validatePincode } from "../validators";

const BillingInit = {
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "",
    gstin: "",
};

export interface BillingRef {
    getData: () => {
        street: string;
        city: string;
        district: string;
        state: string;
        pincode: string;
        country: string;
        gstin: string;
    };
    validate: () => boolean;
}
type Props = {
    isHidden: boolean;
};
const Billing = forwardRef<BillingRef, Props>(({ isHidden }, ref) => {
    const [billing, setBilling] = useState(BillingInit);
    const [error, setError] = useState(BillingInit);

    const { city, country, district, pincode, state, street, gstin } = billing;

    const handleChangeBillingAddress = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError(BillingInit);
        setBilling((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    useImperativeHandle(
        ref,
        () => {
            return {
                getData: () => billing,
                validate: () => {
                    const [isValid, errors] = validateBillingDetails(billing);
                    if (!isValid && errors) {
                        setError(errors);
                        return false;
                    }
                    return true;
                },
            };
        },
        [billing]
    );

    useEffect(() => {
        const getData = setTimeout(() => {
            if (!pincode) return;
            validatePincode(pincode)
                .then((res) => {
                    setBilling((prev) => ({
                        ...prev,
                        ...res,
                    }));
                })
                .catch(() => {
                    setError((prev) => ({
                        ...prev,
                        pincode: "Invalid Pincode",
                    }));
                });
        }, 1000);
        return () => {
            clearTimeout(getData);
        };
    }, [pincode]);

    const isInvalid =
        !!error.city ||
        !!error.country ||
        !!error.district ||
        !!error.pincode ||
        !!error.state ||
        !!error.street ||
        !!error.gstin;
    return (
        <FormControl isInvalid={isInvalid} hidden={isHidden}>
            <Text
                fontSize={"xl"}
                fontWeight={"medium"}
                pt={"1rem"}
                textAlign={"center"}
            >
                Billing Address
            </Text>
            <Text>GSTIN</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter GSTIN"}
                isInvalid={!!error.gstin}
                value={gstin}
                onChange={handleChangeBillingAddress}
                name="gstin"
            />
            <Text pt={"1rem"}>Address Line 1</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter Street Name"}
                isInvalid={!!error.street}
                value={street}
                onChange={handleChangeBillingAddress}
                name="street"
                mb={"1rem"}
            />
            <Text>Address Line 2</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter City"}
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

            {error.street && (
                <FormErrorMessage>{error.street}</FormErrorMessage>
            )}
            {error.city && <FormErrorMessage>{error.city}</FormErrorMessage>}
            {error.district && (
                <FormErrorMessage>{error.district}</FormErrorMessage>
            )}
            {error.pincode && (
                <FormErrorMessage>{error.pincode}</FormErrorMessage>
            )}
            {error.country && (
                <FormErrorMessage>{error.country}</FormErrorMessage>
            )}
            {error.state && <FormErrorMessage>{error.state}</FormErrorMessage>}
            {error.gstin && <FormErrorMessage>{error.gstin}</FormErrorMessage>}
        </FormControl>
    );
});

export default Billing;
