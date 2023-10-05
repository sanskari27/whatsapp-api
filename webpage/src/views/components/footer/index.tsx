import {Flex } from "@chakra-ui/react";
import { FACEBOOK, INSTAGRAM, TWITTER, WHATSAPP } from "../../../assets/Images";

export default function Footer() {
    return (
        <Flex px='3rem' py='1rem' className="flex-col justify-between text-sm items-center gap-y-3 md:flex-row md:text-m">
            <span>Logo</span>
            <a className="cursor-pointer text-green-700">Privacy Policy</a>
            <span>&copy; Whatsleads </span>
            <a className="cursor-pointer text-green-700">Terms & Conditions</a>
            <span className="flex gap-x-2">
                <a className="cursor-pointer"><img src={FACEBOOK}/></a>
                <a className="cursor-pointer"><img src={INSTAGRAM}/></a>
                <a className="cursor-pointer"><img src={TWITTER}/></a>
                <a className="cursor-pointer"><img src={WHATSAPP}/></a>
            </span>
        </Flex>
    );
}