import {
    Box,
    FormControl,
    FormErrorMessage,
    HStack,
    Input,
    Text,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { validatePersonalDetails } from "../validators";

const DetailsInit = {
    name: "",
    phone_number: "",
    email: "",
    type: "one-time" as "one-time" | "subscription",
};
export interface DetailsRef {
    getData: () => {
        name: string;
        phone_number: string;
        email: string;
        type: "one-time" | "subscription";
    };
    validate: () => boolean;
}

type Props = {
    isHidden: boolean;
};

const Details = forwardRef<DetailsRef, Props>(({ isHidden }, ref) => {
    const [error, setError] = useState(DetailsInit);

    const [details, setDetails] = useState(DetailsInit);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(DetailsInit);
        setDetails((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handlePaymentType = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(DetailsInit);
        setDetails((prev) => ({
            ...prev,
            type: e.target.checked ? "subscription" : "one-time",
        }));
    };

    useImperativeHandle(
        ref,
        () => ({
            getData: () => details,
            validate: () => {
                const [isValid, errors] = validatePersonalDetails(details);

                if (!isValid && errors) {
                    setError(errors);
                    return false;
                }
                return true;
            },
        }),
        [details]
    );

    const { name, phone_number, email, type } = details;

    return (
        <FormControl
            isInvalid={!!error.name || !!error.phone_number || !!error.email}
            hidden={isHidden}
        >
            <Text
                fontSize={"xl"}
                fontWeight={"medium"}
                pt={"1rem"}
                textAlign={"center"}
            >
                Personal Details
            </Text>


            <Text pt={"1rem"}>Full Name</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter Your Name"}
                isInvalid={!!error.name}
                value={name}
                onChange={handleChange}
                name="name"
                mb={"1rem"}
            />
            <Text>Phone Number</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter Your Phone Number"}
                isInvalid={!!error.phone_number}
                value={phone_number}
                onChange={handleChange}
                name="phone_number"
                mb={"1rem"}
                type="tel"
            />
            <Text>Email Address</Text>
            <Input
                backgroundColor={"#E8E8E8"}
                placeholder={"Enter Your Email"}
                isInvalid={!!error.email}
                value={email}
                onChange={handleChange}
                name="email"
                mb={"1rem"}
            />
            <Box>
                <Text pb={"0.5rem"}>Payment Type</Text>
                <HStack gap={"1rem"}>
                    <Text>One Time</Text>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={type === "subscription"}
                            onChange={handlePaymentType}
                        />
                        <span className="peer rounded-full outline-none duration-500 after:duration-300 w-10 h-1 bg-gray-300 peer-focus:ring-gray-500  after:content-[''] after:rounded-full after:absolute after:outline-none after:h-4 after:w-4 after:bg-green-600 after:-top-[6px] after:-left-1 after:flex after:justify-center after:items-center   peer-checked:after:translate-x-8"></span>
                    </label>
                    <Text>Subscription</Text>
                </HStack>
            </Box>
            {error.name && <FormErrorMessage>{error.name}</FormErrorMessage>}
            {error.phone_number && (
                <FormErrorMessage>{error.phone_number}</FormErrorMessage>
            )}
            {error.email && <FormErrorMessage>{error.email}</FormErrorMessage>}
        </FormControl>
    );
});

export default Details;
