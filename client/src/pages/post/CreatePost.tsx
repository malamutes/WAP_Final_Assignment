import { Button, Card, Container } from "react-bootstrap";
import { useUserContext } from "../../context/userContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function CreatePost() {
    const { user } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?._id) {
            console.log("ADJISAODAJ")
        }


    }, [])

    console.log(user);
    return (
        <>
            {user?._id
                ?
                (
                    <Container>
                        ADJASIODJODJ
                    </Container>
                )
                :
                (
                    <Container>
                        YOU NEED TO BE LOGGED IN
                        <Button onClick={() => navigate("/login")}>
                            LOGIN
                        </Button>
                    </Container>
                )}

        </>
    )
}