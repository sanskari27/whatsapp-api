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

type DetailsProps = {
    name: string;
    phone_number: string;
    email: string;
    type: string;
    error: {
        name: string;
        phone_number: string;
        email: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePaymentType: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNext: () => void;
};

const Details = ({
    email,
    error,
    name,
    type,
    phone_number,
    handleChange,
    handlePaymentType,
    handleNext,
}: DetailsProps) => {
    return (
        <FormControl
            isInvalid={!!error.name || !!error.phone_number || !!error.email}
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
            <Box pb={"2rem"}>
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
                        <div className="peer rounded-full outline-none duration-500 after:duration-300 w-10 h-1 bg-gray-300 peer-focus:ring-gray-500  after:content-[''] after:rounded-full after:absolute after:outline-none after:h-4 after:w-4 after:bg-green-600 after:-top-[6px] after:-left-1 after:flex after:justify-center after:items-center   peer-checked:after:translate-x-8"></div>
                    </label>
                    <Text>Subscription</Text>
                </HStack>
            </Box>
            <FormErrorMessage>{`${error.phone_number} ${error.name} ${error.email}`}</FormErrorMessage>
            <Button
                backgroundColor={THEME.THEME_GREEN}
                color={"white"}
                width={"full"}
                _hover={{ backgroundColor: "green.500" }}
                onClick={handleNext}
            >
                Next
            </Button>
        </FormControl>
    );
};

export default Details;
