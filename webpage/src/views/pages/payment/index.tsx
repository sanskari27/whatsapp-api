import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    Image,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PAYMENT } from "../../../assets/Images";
import { PLAN_TYPE, ROUTES, THEME } from "../../../utils/const";

const PaymentPage = () => {
    const params = useParams();
    const { plan } = params as { plan: string };

    const [error, setError] = useState({
        name: "",
        phone: "",
    });

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        price:
            plan === PLAN_TYPE.SILVER
                ? "1500"
                : plan === PLAN_TYPE.SILVER_YEARLY
                ? "15000"
                : plan === PLAN_TYPE.GOLD
                ? "2500"
                : plan === PLAN_TYPE.GOLD_YEARLY
                ? "25000"
                : plan === PLAN_TYPE.PLATINUM
                ? "3000"
                : plan === PLAN_TYPE.PLATINUM_YEARLY
                ? "30000"
                : "0",
    });

    const { name, phone, price } = formData;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError({ ...error, name: "", phone: "" });
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const numbers = phone.split(",");

        if (!name)
            return setError({
                ...error,
                name: "Name Required",
            });

        if (!phone)
            return setError({
                ...error,
                phone: "Phone Number Required",
            });

        if (plan === PLAN_TYPE.GOLD || plan === PLAN_TYPE.GOLD_YEARLY) {
            return numbers.length > 0
                ? setError({ ...error, phone: "Upto one number allowed" })
                : setError({ ...error, phone: "" });
        }

        if (plan === PLAN_TYPE.SILVER || plan === PLAN_TYPE.SILVER_YEARLY) {
            console.log(numbers.length);
            return numbers.length > 2
                ? setError({ ...error, phone: "Upto two number allowed" })
                : setError({ ...error, phone: "" });
        }

        if (plan === PLAN_TYPE.PLATINUM || plan === PLAN_TYPE.PLATINUM_YEARLY) {
            return numbers.length > 4
                ? setError({ ...error, phone: "Upto four number allowed" })
                : setError({ ...error, phone: "" });
        }
    };

    if (!Object.values(PLAN_TYPE).includes(plan)) {
        return <Navigate to={ROUTES.PRICE} />;
    }

    return (
        <VStack>
            <Text fontSize={"2xl"} fontWeight={"medium"} py={"3rem"}>
                Complete Your{" "}
                <Box as="span" color={THEME.THEME_GREEN}>
                    Payment
                </Box>
            </Text>
            <Flex
                direction={"column"}
                gap={"1rem"}
                rounded={"xl"}
                boxShadow={"0px 0px 10px 5px rgba(0,0,0,0.15)"}
                width={"90vw"}
                maxWidth={"600px"}
                p={"2rem"}
            >
                <Image
                    src={PAYMENT}
                    alt={"Payment"}
                    height={"100px"}
                    mx={"auto"}
                />
                <FormControl isInvalid={!!error.name}>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter Your Name"}
                        isInvalid={!!error.name}
                        value={name}
                        onChange={handleChange}
                        name="name"
                    />
                    <FormErrorMessage>{error.name}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!error.phone}>
                    <Input
                        backgroundColor={"#E8E8E8"}
                        placeholder={"Enter Your Phone Number"}
                        isInvalid={!!error.phone}
                        value={phone}
                        onChange={handleChange}
                        name="phone"
                    />
                    <FormErrorMessage>{error.phone}</FormErrorMessage>
                </FormControl>
                <Input
                    backgroundColor={"#E8E8E8"}
                    mb={"1rem"}
                    defaultValue={price}
                    disabled
                />
                <Button
                    backgroundColor={THEME.THEME_GREEN}
                    color={"white"}
                    width={"full"}
                    _hover={{ backgroundColor: "green.500" }}
                    onClick={handleSubmit}
                >
                    Pay Now
                </Button>
            </Flex>
        </VStack>
    );
};
export default PaymentPage;
