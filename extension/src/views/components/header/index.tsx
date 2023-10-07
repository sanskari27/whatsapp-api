import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, Image, Switch, Text } from "@chakra-ui/react";
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
        <Box
            width="full"
            height="full"
            display="flex"
            gap={"1rem"}
            alignItems="center"
        >
            <Image src={LOGO} width={9} />
            <Text
                className="text-black dark:text-white"
                flexGrow={1}
                fontSize={"lg"}
                fontWeight="bold"
            >
                WhatsLeads
            </Text>
            <Switch
                onChange={handleSwitch}
                isChecked={theme === "dark" ? true : false}
                colorScheme="green"
            />
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
                    <Button variant={"link"} onClick={handleSettingClicked}>
                        <Image
                            src={SETTINGS}
                            width={4}
                            height={4}
                            className="invert dark:invert-0"
                            onClick={handleSettingClicked}
                        />
                    </Button>
                )
            ) : null}
        </Box>
    );
}
