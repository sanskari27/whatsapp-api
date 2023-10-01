import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Flex, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useSearchParams } from "react-router-dom";
import useWindowSize from "react-use/lib/useWindowSize";
import { BACKGROUND } from "../../../assets/Images";
import { RAZORPAY_KEY_ID, SERVER_URL } from "../../../utils/const";
import PageWrapper from "../../components/pageWrapper";

export default function InitiateRazorpayPayment() {
    //get url query params from react hook

    const [searchParams] = useSearchParams();
    const [transactionCompleted, setTransactionCompleted] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        const currency = searchParams.get("currency");
        const name = searchParams.get("name");
        const description = searchParams.get("description");
        const order_id = searchParams.get("order_id");
        const transaction_id = searchParams.get("transaction_id");

        const options = {
            key: RAZORPAY_KEY_ID as string,
            currency: currency as string,
            name: name as string,
            description: description as string,
            order_id: order_id as string,
            handler: function () {
                fetch(
                    `${SERVER_URL}/payment/${transaction_id}/verify-payment`,
                    {
                        method: "POST",
                    }
                ).finally(() => {
                    setTransactionCompleted(true);
                });
            },

            callback_url: `${SERVER_URL}/payment/${transaction_id}/verify-payment`,
            theme: {
                color: "#4CB072",
            },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp1 = new (window as any).Razorpay(options);

        rzp1.open();
    }, [searchParams]);

    if (!transactionCompleted) return <></>;

    return (
        <PageWrapper>
            <Confetti width={width} height={height} />
            <Flex
                direction={"column"}
                height={"full"}
                my={"auto"}
                justifyContent={"space-between"}
            >
                <VStack
                    alignItems="center"
                    justifyContent="center"
                    my="auto"
                    spacing={4}
                >
                    <Flex
                        bg="#4CB07266"
                        alignItems="center"
                        py="0.7rem"
                        px="2.5rem"
                        rounded="lg"
                    >
                        <InfoOutlineIcon mr="10px" color="#235C39" />{" "}
                        <Text color="#235C39" className="text-sm md:text-lg">
                            Your Transaction has been completed
                        </Text>
                    </Flex>
                    <Flex>
                        <Text fontWeight="bold">
                            Open our extension to see the changes!!
                        </Text>
                    </Flex>
                </VStack>
                <Image src={BACKGROUND} alt="Payment Success" />
            </Flex>
        </PageWrapper>
    );
}
