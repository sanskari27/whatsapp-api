import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Flex,
    Image,
    Text,
} from "@chakra-ui/react";
import {
    CHROME,
    ENHANCHMENT,
    EXPORT,
    HERO_BG,
    RATING,
    REPORT,
    SCREEN_SHOT,
} from "../../../assets/Images";
import { THEME } from "../../../utils/const";
import PageWrapper from "../../components/pageWrapper";

const Home = () => {
    return (
        <PageWrapper>
            <Box>
                <Flex
                    width={"full"}
                    justifyContent={"space-around"}
                    backgroundImage={` linear-gradient(to right,rgba(255,255,255,1),rgba(255,255,255,1), rgba(255,255,255,0.7)), url('${HERO_BG}')`}
                    alignItems={"center"}
                    className="flex-col md:flex-row"
                    px={"1rem"}
                    height={"100vh"}
                >
                    <Box>
                        <Box pb={"2rem"}>
                            <Text
                                className="text-md text-center md:text-2xl md:text-left "
                                fontWeight={"medium"}
                            >
                                A Chrome extension for{" "}
                                <Box as="span" color={THEME.THEME_GREEN}>
                                    Whatsapp
                                </Box>{" "}
                                that
                            </Text>
                            <Text
                                className="text-md text-center md:text-2xl md:text-left "
                                fontWeight={"medium"}
                            >
                                enables you to effortlessly export
                            </Text>
                            <Text
                                className="text-md text-center md:text-2xl md:text-left "
                                fontWeight={"medium"}
                            >
                                all your contacts with just
                            </Text>
                            <Text
                                className="text-md text-center md:text-2xl md:text-left "
                                fontWeight={"medium"}
                            >
                                one click.
                            </Text>
                        </Box>
                        <Flex direction={"column"}>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Instantly export thousands of contacts
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Export in CSV and VCF format
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Pay once and download unlimited times for a
                                    month
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} gap={"0.25rem"}>
                                <Box
                                    height={"7px"}
                                    width={"7px"}
                                    rounded={"full"}
                                    backgroundColor={THEME.THEME_GREEN}
                                />
                                <Text fontSize={"sm"}>
                                    Find unsaved Clients to Grow your Business
                                </Text>
                            </Flex>
                            <Button
                                size={"md"}
                                backgroundColor={THEME.THEME_GREEN}
                                color={"white"}
                                rounded={"full"}
                                className="my-4 mx-auto md:ml-0"
                            >
                                <Image src={CHROME} alt="" height={"60%"} />
                                <Text px={"0.5rem"}>Add to Chrome</Text>
                            </Button>
                        </Flex>
                    </Box>
                    <Flex className="w-full md:w-1/2" justifyContent={"center"}>
                        <Image
                            className="w-2/3"
                            maxWidth={"500px"}
                            minWidth={"300px"}
                            src={SCREEN_SHOT}
                            alt=""
                        />
                    </Flex>
                </Flex>
                <Flex
                    width={"full"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    direction={"column"}
                    gap={"2rem"}
                    mt={"2rem"}
                    id="features"
                >
                    <Text
                        fontSize={"2xl"}
                        textAlign={"center"}
                        fontWeight={"medium"}
                        py={"2rem"}
                    >
                        What is{" "}
                        <Box as="span" color={THEME.THEME_GREEN}>
                            WhatsLeads ?
                        </Box>{" "}
                        <Box
                            color={"black"}
                            fontSize={"xl"}
                            maxWidth={"900px"}
                            width={"90vw"}
                            pb={"2rem"}
                            pt={"1rem"}
                        >
                            Experience enhanced privacy and effortless contact
                            management with our Chrome Extension designed for
                            WhatsApp enthusiasts and businesses.
                        </Box>
                        <Box
                            color={"black"}
                            fontSize={"md"}
                            fontWeight={"light"}
                            maxWidth={"900px"}
                            width={"90vw"}
                        >
                            Tailored for WhatsApp status influencers and
                            businesses relying on WhatsApp for communication,
                            WhatsLeads provides convenient features such as
                            instant contact saving and comprehensive contact
                            list export. Furthermore, it enhances privacy by
                            offering an option to blur WhatsApp Web contents,
                            including contact photos, names, and chats, adding
                            an extra layer of confidentiality to your
                            interactions while still saving you precious time.
                        </Box>
                    </Text>
                </Flex>
                <Flex
                    className="flex-col md:flex-row"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                    pt={"4rem"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={ENHANCHMENT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Text
                            fontSize={"xl"}
                            fontWeight={"medium"}
                            className="text-center md:text-left"
                        >
                            Enhanced{" "}
                            <Box as={"span"} color={THEME.THEME_GREEN}>
                                {" "}
                                Privacy Controls
                            </Box>
                        </Text>
                        <Text className="text-center md:text-left">
                            Your Privacy, Your Way: Take charge of your WhatsApp
                            Web experience with our privacy controls. Choose
                            which elements to blur, including chat content,
                            contact details, recent messages, contact names, and
                            profile photos. Your privacy, your rules.
                        </Text>
                    </Box>
                </Flex>
                <Flex
                    className="flex-col md:flex-row-reverse"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                    pt={"4rem"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={REPORT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Box>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                                color={THEME.THEME_GREEN}
                            >
                                Export Contacts{" "}
                                <Box as={"span"} color={"black"}>
                                    {" "}
                                    with Ease
                                </Box>
                            </Text>
                        </Box>
                        <Text className="text-center md:text-left">
                            Seamless Exporting: Export your contacts in a flash.
                            With support for CSV and VCF formats, you have the
                            flexibility to save your contacts the way you want.
                            And the best part? There's no limit on the number of
                            downloads.
                        </Text>
                    </Box>
                </Flex>
                <Flex
                    className="flex-col md:flex-row"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                    pt={"4rem"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={EXPORT}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Box>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                                color={THEME.THEME_GREEN}
                            >
                                Unlimited number{" "}
                                <Box as={"span"} color={"black"}>
                                    {" "}
                                    of downloads
                                </Box>
                            </Text>
                        </Box>
                        <Text className="text-center md:text-left">
                            Freedom to Export: Download your contacts without
                            any restrictions. Let it be chat contact, group, or
                            label. We’ve got you covered.
                        </Text>
                    </Box>
                </Flex>
                {/* <Flex
                    className="flex-col md:flex-row-reverse"
                    justifyContent={"center"}
                    gap={"2rem"}
                    alignItems={"center"}
                    pt={"2rem"}
                >
                    <Box>
                        <Image
                            width={"400px"}
                            maxWidth={"350px"}
                            src={CUSTOMER}
                            alt=""
                        />
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Box>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                className="text-center md:text-left"
                            >
                                Get 24/7 Customer Support{" "}
                            </Text>
                            <Text
                                fontSize={"xl"}
                                fontWeight={"medium"}
                                color={THEME.THEME_GREEN}
                            >
                                {" "}
                                Whenever You Need It
                            </Text>
                        </Box>
                        <Text className="text-center md:text-left">
                            Our team is available 24/7 by WhatsApp to answer any
                            questions you have or help you troubleshoot any
                            issues you encounter. Our average response time is
                            less than 5 minutes.
                        </Text>
                    </Box>
                </Flex> */}
                <Box>
                    <Text
                        textAlign={"center"}
                        fontWeight={"medium"}
                        fontSize={"xl"}
                    >
                        What Customers Love About WhatsLeads
                    </Text>

                    <Flex
                        gap={"5rem"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        pt={"3rem"}
                        className="flex-col md:flex-row"
                        flexWrap={"wrap"}
                    >
                        <Flex
                            direction={"column"}
                            justifyContent={"space-between"}
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                            height={"338px"}
                        >
                            <Box>
                                <Flex
                                    width={"full"}
                                    justifyContent={"space-between"}
                                >
                                    <Text fontWeight={"medium"}>
                                        Emily{" "}
                                        <Box
                                            as="span"
                                            textColor={THEME.THEME_GREEN}
                                        >
                                            Turner
                                        </Box>{" "}
                                    </Text>
                                    <Image
                                        height={"15px"}
                                        src={RATING}
                                        alt=""
                                    />
                                </Flex>
                                <Text fontSize={"sm"} pt={"1rem"}>
                                    This extension is a perfect example of how
                                    simplicity can be powerful. I'm not a
                                    tech-savvy person, but I found the interface
                                    to be incredibly intuitive. The privacy
                                    settings are fantastic, and the unlimited
                                    downloads for contacts make it stand out.
                                    It's become an essential part of my WhatsApp
                                    Web experience. Thank you for making my life
                                    easier!
                                </Text>
                            </Box>
                            <Text
                                fontWeight={"medium"}
                                textColor={THEME.THEME_GREEN}
                                py={"1rem"}
                            >
                                Simple Yet Powerful
                            </Text>
                        </Flex>
                        <Flex
                            direction={"column"}
                            justifyContent={"space-between"}
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                            height={"338px"}
                        >
                            <Box>
                                <Flex
                                    width={"full"}
                                    justifyContent={"space-between"}
                                >
                                    <Text fontWeight={"medium"}>
                                        David{" "}
                                        <Box
                                            as="span"
                                            textColor={THEME.THEME_GREEN}
                                        >
                                            Martinez
                                        </Box>{" "}
                                    </Text>
                                    <Image
                                        height={"15px"}
                                        src={RATING}
                                        alt=""
                                    />
                                </Flex>
                                <Text fontSize={"sm"} pt={"1rem"}>
                                    As a business owner who uses WhatsApp for
                                    client communication, this extension has
                                    been a lifesaver. The ability to categorize
                                    and export contacts with ease has
                                    streamlined my workflow significantly. I can
                                    now find and reach out to clients quickly.
                                    It's user-friendly and has saved me a ton of
                                    time. Kudos to the developers for creating
                                    such a valuable tool!
                                </Text>
                            </Box>
                            <Text
                                fontWeight={"medium"}
                                textColor={THEME.THEME_GREEN}
                                py={"1rem"}
                            >
                                Effortless Contact Management
                            </Text>
                        </Flex>
                        <Box
                            minWidth={"350px"}
                            maxWidth={"400px"}
                            width={"80vw"}
                            boxShadow={"0px 0px 10px 5px #00000029"}
                            rounded={"2xl"}
                            p={"1rem"}
                        >
                            <Flex
                                width={"full"}
                                justifyContent={"space-between"}
                            >
                                <Text fontWeight={"medium"}>
                                    Sarah{" "}
                                    <Box
                                        as="span"
                                        textColor={THEME.THEME_GREEN}
                                    >
                                        Johnson
                                    </Box>{" "}
                                </Text>
                                <Image height={"15px"} src={RATING} alt="" />
                            </Flex>

                            <Text fontSize={"sm"} pt={"1rem"}>
                                I stumbled upon this extension while searching
                                for ways to enhance my privacy on WhatsApp Web,
                                and I must say it's been a game-changer! The
                                privacy controls allow me to blur chat content,
                                contact names, and profile photos, giving me the
                                peace of mind I need. Exporting contacts is a
                                breeze, and the fact that there's no limit on
                                downloads is a huge plus. Highly recommended for
                                anyone who values their privacy and wants to
                                simplify contact management!
                            </Text>
                            <Text
                                fontWeight={"medium"}
                                textColor={THEME.THEME_GREEN}
                                py={"1rem"}
                            >
                                A Game Changer for WhatsApp Privacy
                            </Text>
                        </Box>
                    </Flex>
                </Box>
                <Flex
                    id="pricing"
                    direction={"column"}
                    py={"3rem"}
                    px={"1rem"}
                    alignItems={"center"}
                >
                    <Text
                        textAlign={"center"}
                        fontSize={"2xl"}
                        fontWeight={"medium"}
                        pb={"2rem"}
                    >
                        <Box as={"span"} color={THEME.THEME_GREEN}>
                            Simple Pricing{" "}
                        </Box>
                        For You
                    </Text>
                    <Flex
                        className="flex-col md:flex-row w-11/12 justify-evenly gap-8 md:gap-0"
                        boxShadow={"0px 0px 10px 5px rgba(0, 0, 0, 0.1)"}
                        rounded={"2xl"}
                        p={"2rem"}
                        mb={"2rem"}
                    >
                        <Box textAlign={"center"}>
                            <Text
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                                fontWeight={"medium"}
                            >
                                Free
                            </Text>
                            <Text color={"gray.400"} p={"0.25rem"}>
                                Rs. 0/mo
                            </Text>
                            <Text fontSize={"sm"} pt={"0.25rem"}>
                                Unlock Basic Privacy for
                            </Text>
                            <Text fontSize={"sm"} pb={"0.25rem"}>
                                Free
                            </Text>
                            <Button
                                backgroundColor={THEME.THEME_GREEN}
                                color={"white"}
                                rounded={"full"}
                            >
                                Get Started For Free
                            </Button>
                        </Box>
                        <Box>
                            <Text
                                className="text-center md:text-left"
                                pb={"2rem"}
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                            >
                                -Feature-
                            </Text>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Blur Chat Content</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Blur Contact Names</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Blur Profile Photos</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Basic Privacy Controls</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>No Cost</Text>
                            </Flex>
                        </Box>
                        <Box>
                            <Text
                                className="text-center md:text-left"
                                pb={"2rem"}
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                            >
                                -Benefits-
                            </Text>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Protect your sensitive information</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>
                                    Customize WhatsApp Web to your comfort level
                                </Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>
                                    Experience enhanced privacy at no cost
                                </Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={"black"}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>
                                    Ideal for individual users who value their
                                    privacy
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>
                    <Flex
                        className="flex-col md:flex-row w-11/12 justify-evenly gap-8 md:gap-0"
                        boxShadow={"0px 0px 10px 5px rgba(0, 0, 0, 0.1)"}
                        rounded={"2xl"}
                        p={"2rem"}
                    >
                        <Box textAlign={"center"}>
                            <Text
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                                fontWeight={"medium"}
                            >
                                Free
                            </Text>
                            <Text color={"gray.400"} p={"0.25rem"}>
                                Rs. 2500/mo
                            </Text>
                            <Text fontSize={"sm"} pt={"0.25rem"}>
                                Upgrade To Premium
                            </Text>
                            <Text fontSize={"sm"} pb={"0.25rem"}>
                                Privacy & Export
                            </Text>
                            <Button
                                backgroundColor={"white"}
                                color={"black"}
                                rounded={"full"}
                                borderColor={THEME.THEME_GREEN}
                                borderWidth={"1px"}
                                boxShadow={"0px 0px 10px 5px #0080001f"}
                                mt={"1rem"}
                            >
                                Upgrade To Premium
                            </Button>
                        </Box>
                        <Box>
                            <Text
                                className="text-center md:text-left"
                                pb={"2rem"}
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                            >
                                -Feature-
                            </Text>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Blur Contact Names</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Blur Profile Photos</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Basic Privacy Controls</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Export Contacts (CSV/VCF)</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Unlimited Downloads</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    minWidth={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>
                                    Ideal for Businesses and Power Users
                                </Text>
                            </Flex>
                        </Box>
                        <Box>
                            <Text
                                className="text-center md:text-left"
                                pb={"2rem"}
                                color={THEME.THEME_GREEN}
                                fontSize={"2xl"}
                            >
                                -Benefits-
                            </Text>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Take control of your privacy</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Streamline contact management</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>Export contacts for business needs</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>No limits on downloads</Text>
                            </Flex>
                            <Flex className="items-start md:items-center">
                                {" "}
                                <Box
                                    className="mt-2 md:mt-0 text-green-500"
                                    height={"5px"}
                                    width={"5px"}
                                    backgroundColor={THEME.THEME_GREEN}
                                    rounded={"full"}
                                    mr={"0.25rem"}
                                />
                                <Text>
                                    Perfect for businesses and power users
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>
                </Flex>
                <Flex
                    className="flex-col md:flex-row items-center md:items-start"
                    width={"full"}
                    justifyContent={"center"}
                    gap={"2rem"}
                    id="faq"
                >
                    <Box>
                        <Text
                            textAlign={"left"}
                            fontSize={"2xl"}
                            color={THEME.THEME_GREEN}
                        >
                            Have Some Question?
                        </Text>
                        <Text textAlign={"left"} fontSize={"lg"}>
                            We've Got Answers
                        </Text>
                    </Box>
                    <Accordion allowToggle width={"90vw"} maxW={"800px"}>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Does WhatsLeads extension store my
                                        personal information?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                No, WhatsLeads simply transfers data from
                                Whatsapp Web and transfers it to your computer.
                                Your personal data is not exposed to WhatsLeads
                                or any third party.
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Does this extension violate the Terms of
                                        Policy of Whatsapp?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                No. Using our Chrome extension is in compliance
                                with WhatsApp's Terms of Service.
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Is it safe to scan my WhatsApp app on
                                        this extension?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                You can trust WhatsLeads for a safe and secure
                                experience. We scan to help you export contacts,
                                all while ensuring your data protection using
                                AWS (Amazon Web Services). Your privacy is our
                                priority.
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Can I export contacts from any groups
                                        and labels?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                Absolutely, you have the flexibility to export
                                numbers from all your groups and labels or
                                select specific groups and labels for contact
                                export. Tailor it to your needs!
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        What formats are supported while
                                        downloading contacts?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                You have the choice to export in either CSV or
                                VCF format, whichever suits your preferences.
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Does WhatsLeads store my credit card or
                                        debit card information?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                No, WhatsLeads processes all payments and credit
                                card data through Razorpay, a secure 3rd party
                                service that protects all your data and
                                transactions. WhatsLeads doesn’t store your
                                payment information.
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        What payment methods do you accept?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                We offer multiple payment options to cater to
                                your convenience, including UPI, Internet
                                Banking, Debit Card, Credit Card, and various
                                wallets.
                            </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem>
                            <Text>
                                <AccordionButton
                                    _expanded={{ color: THEME.THEME_GREEN }}
                                    _hover={{ bg: "none" }}
                                    py={"1rem"}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        Can I change my number or get a refund?
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </Text>
                            <AccordionPanel pb={4} fontSize={"sm"}>
                                Users are not able to change their subscribed
                                numbers, and refunds are not provided. Please
                                reach out to customer support for more help on
                                this at wa.me/9785562665
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </Flex>
            </Box>
        </PageWrapper>
    );
};
export default Home;
