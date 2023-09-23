import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { useNavigate } from "react-router";
import { BACK } from "../../../assets/Images";

const BackButton = () => {
    const navigate = useNavigate();
    return (
        <Button
            variant={"link"}
            alignSelf={"flex-start"}
            onClick={() => navigate(-1)}
            paddingX={0}
        >
            <Image src={BACK} alt="" className="invert-0 dark:invert" />
        </Button>
    );
};
export default BackButton;
