import { Box, Flex, Image, Radio } from "@chakra-ui/react";
import { COUPON_BANNER } from "../../../../assets/Images";
import { COUPON_STATUS } from "../../../../config/const";

type CouponBannerProps = {
    isChecked: boolean;
    onClick: ({ name, value }: { name: string; value: string }) => void;
    children: React.ReactNode;
};

const CouponBanner = ({ isChecked, onClick, children }: CouponBannerProps) => {
    const handleChange = (code: string) => {
        onClick({
            name: COUPON_STATUS.CODE,
            value: code,
        });
    };

    return (
        <Box as="label" width={"full"}>
            <Flex
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
                    handleChange("WELCOME");
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
                    {children}
                </Box>
                <Radio colorScheme="#4CB072" isChecked={isChecked} />
            </Flex>
        </Box>
    );
};

export default CouponBanner;
