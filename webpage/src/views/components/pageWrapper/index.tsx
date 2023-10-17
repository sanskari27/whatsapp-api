import { Flex } from "@chakra-ui/react";
import Footer from "../footer";
import Navbar from "../navbar";

type PageWrapperProps = {
    children: React.ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
    let smoothScroll = (id: string) => {
        let element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' })
    }
    return (
        <Flex
            direction={"column"}
            minHeight={"100vh"}
            width={"100vw"}
            className="pt-14 pb-[198px] md:pt-[55px] md:pb-14"
            mb='1rem'
        >
            <Navbar scrollFunction={smoothScroll}/>
            {children}
            <Footer scrollFunction={smoothScroll}/>
        </Flex>
    );
};

export default PageWrapper;
