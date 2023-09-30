import { Flex } from "@chakra-ui/react";
import Footer from "../footer";
import Navbar from "../navbar";

type PageWrapperProps = {
    children: React.ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <Flex direction={"column"} height={"100vh"} minHeight={"100vh"}>
            <Navbar />
            {children}
            <Footer />
        </Flex>
    );
};

export default PageWrapper;
