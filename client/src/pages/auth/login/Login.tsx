import { useEffect, useState } from "react";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserContext } from "../../../context/userContext";

export default function Login() {

    const [username, setUsername] = useState("");
    const [userpassword, setUserPassword] = useState("");
    const [validatedUser, setValidatedUser] = useState(true);
    const [validatedPass, setValidatedPass] = useState(true);
    const [initial, setInitial] = useState(true)

    const { setUser } = useUserContext();

    const navigate = useNavigate();
    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        e.stopPropagation();
        setInitial(false);

        if (username.length < 6 || username.length > 30) {
            setValidatedUser(false);

        }

        if (userpassword.length < 6 || userpassword.length > 30) {
            setValidatedPass(false);
        }

        else {
            setValidatedUser(true);
            setValidatedPass(true);
            try {
                const loginInfo = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: username, userpassword: userpassword })
                });

                const reply = await loginInfo.json();
                if (loginInfo.ok) {
                    setUser({ username: reply.username ?? "FALLBACK NAME", userId: reply.userID ?? "FALLBACK ID" });
                    navigate('/');
                    console.log("LOGIN SUCCESSFUL!", reply.valid)
                }
                else {
                    console.error('LOGIN FAILED', reply.message);
                }
            }
            catch (e) {
                console.log("ERROR LOGGGING IN : ", e)
            }
        }
    }

    return (
        <Row style={{ width: '30%' }}>
            <Col>
                <Form onSubmit={handleLoginSubmit}>
                    <FloatingLabel controlId="floatingInput" label="Username" className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={true}
                            isInvalid={initial ? false : !validatedUser}
                        />
                        <Form.Control.Feedback type="invalid">
                            Username must be between 6 and 30 characters.
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={userpassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required={true}
                            isInvalid={initial ? false : !validatedPass}
                        />
                        <Form.Control.Feedback type="invalid">
                            Password must be between 6 and 30 characters.
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <Button type="submit">Login</Button>
                </Form>

            </Col>
        </Row>
    )
}