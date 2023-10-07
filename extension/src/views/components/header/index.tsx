import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOGO, SETTINGS } from "../../../assets/Images";
import { NAVIGATION } from "../../../config/const";
import { useAuth } from "../../../hooks/useAuth";

export default function Header() {
    const location = useLocation();
    const isSettingsPage = location.pathname === NAVIGATION.SETTINGS;
    const navigate = useNavigate();

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    const { isAuthenticated } = useAuth();

    const handleSettingClicked = () => {
        if (isSettingsPage) {
            navigate(NAVIGATION.HOME);
        } else {
            navigate(NAVIGATION.SETTINGS);
        }
    };

    const handleSwitch = (e: any) => {
        if (e.target.checked) {
            setTheme("dark");
            localStorage.setItem("theme", "dark");
        } else {
            setTheme("light");
            localStorage.setItem("theme", "light");
        }
    };

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    return (
        <Box width="full" height="full" display="flex" alignItems="center">
            <Image src={LOGO} width={9} />
            <Text
                className="text-black dark:text-white"
                flexGrow={1}
                fontSize={"lg"}
                fontWeight="bold"
                ml={"1rem"}
            >
                WhatsLeads
            </Text>
            <Box>
                <label
                    title={`Toggle ${theme === "dark" ? "light" : "dark"} Mode`}
                    className={`${
                        theme === "dark" ? "bg-[#252525]" : "bg-white"
                    } w-[37px] h-[37px] rounded-full grid place-items-center cursor-pointer leading-4`}
                    htmlFor="switch"
                >
                    <input
                        id="switch"
                        className="display-none"
                        type="checkbox"
                        onChange={handleSwitch}
                        checked={theme === "dark" ? true : false}
                    />
                    <div
                        className={`${
                            theme === "dark" ? "-rotate-180 scale-0" : ""
                        } col-span-full row-span-full transition-transform-[500ms] delay-200`}
                    >
                        <svg
                            height="20"
                            width="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                clip-rule="evenodd"
                                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                                fill-rule="evenodd"
                            ></path>
                        </svg>
                    </div>

                    <div
                        className={`${
                            theme === "dark"
                                ? "delay-200 scale-100 -rotate-0"
                                : ""
                        } col-span-full row-span-full transition-transform scale-0`}
                    >
                        <svg
                            height="20"
                            width="20"
                            fill="white"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
                        </svg>
                    </div>
                </label>
            </Box>
            {isAuthenticated ? (
                isSettingsPage ? (
                    <CloseIcon
                        width={4}
                        height={4}
                        className="! text-background-dark  dark:!text-background"
                        onClick={handleSettingClicked}
                        color={"inherit"}
                    />
                ) : (
                    <Button
                        variant={"link"}
                        onClick={handleSettingClicked}
                        p={0}
                    >
                        <Image
                            src={SETTINGS}
                            width={4}
                            height={4}
                            className="invert dark:invert-0"
                        />
                    </Button>
                )
            ) : null}
        </Box>
    );
}
