import {
    Button,
    FormControl,
    FormErrorMessage,
    Input,
    Text,
} from "@chakra-ui/react";
import { THEME } from "../../../../utils/const";

type DetailsProps = {
    name: string;
    phone_number: string;
    email: string;
    error: {
        name: string;
        phone_number: string;
        email: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNext: () => void;
};

const Details = ({
    email,
    error,
    name,
    phone_number,
    handleChange,
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
