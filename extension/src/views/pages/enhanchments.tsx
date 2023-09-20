import { Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { CheckButton } from "./compoments";

const ENHANCHMENT = () => {
    const [message, setMessage] = useState(false);
    const [name, setName] = useState(false);
    const [photo, setPhoto] = useState(false);
    const [conversation, setConversation] = useState(false);
    const [everything, setEverything] = useState(false);
    return (
        <Flex direction={"column"} width="400px" gap={3}>
            <Text>Privacy</Text>
            <Flex>
                <Flex direction="column" justifyContent="center" gap={3}>
                    <CheckButton
                        label="Blur Recent Messages"
                        value={message}
                        setValue={setMessage}
                    />
                    <CheckButton
                        label="Blur Contact Name"
                        value={name}
                        setValue={setName}
                    />
                    <CheckButton
                        label="Blur Contact Photos"
                        value={photo}
                        setValue={setPhoto}
                    />
                    <CheckButton
                        label="Blur Conversation Message"
                        value={conversation}
                        setValue={setConversation}
                    />
                    <CheckButton
                        label="Blur Everything"
                        value={everything}
                        setValue={setEverything}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ENHANCHMENT;
