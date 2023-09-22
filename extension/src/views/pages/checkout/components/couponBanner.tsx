import {
    Box,
    Flex,
    HTMLChakraProps,
    Image,
    Radio,
    UseRadioProps,
    useRadio,
} from "@chakra-ui/react";
import { COUPON_BANNER } from "../../../../assets/Images";

type CouponBannerProps = UseRadioProps &
    HTMLChakraProps<any> & {
        children?: React.ReactNode;
    };

const CouponBanner = (props: CouponBannerProps) => {
    const { getInputProps, getRadioProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getRadioProps();

    return (
        <Box as="label" width={"full"}>
            <input {...input} />
            <Flex
                {...checkbox}
                cursor="pointer"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                _checked={{
                    borderColor: "#4CB072",
                }}
                className="bg-[#ECECEC] text-black dark:text-white dark:bg-[#535353]"
                width={"full"}
                alignItems={"center"}
                fontSize={"md"}
                onClick={() => {
                    console.log(props);
                }}
                px={"1rem"}
                textColor={"#4CB072"}
                textAlign={"right"}
            >
                <Image src={COUPON_BANNER} alignSelf={"end"} height={"70px"} />
                <Box
                    textAlign={"left"}
                    width={"full"}
                    fontSize={"lg"}
                    fontWeight={"semibold"}
                >
                    {props.children}
                </Box>
                <Radio colorScheme="#4CB072" isChecked={props.isChecked} />
            </Flex>
        </Box>
    );
};

export default CouponBanner;
