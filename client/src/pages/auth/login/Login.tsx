import { useEffect, useState } from "react";
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserContext } from "../../../context/userContext";

export default function Login() {

    const { setUser } = useUserContext();
    const [username, setUsername] = useState("");
    const [userpassword, setUserPassword] = useState("");
    const [validatedUser, setValidatedUser] = useState(true);
    const [validatedPass, setValidatedPass] = useState(true);
    const [initial, setInitial] = useState(true)
    const [errorLogin, setErrorLogin] = useState(false);

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
                    body: JSON.stringify({ username: username, userpassword: userpassword }),
                    credentials: 'include'
                });

                const reply = await loginInfo.json();
                if (loginInfo.ok) {
                    navigate('/');
                    setUser(reply.user);
                    console.log("LOGIN SUCCESSFUL!", reply.user);

                    setErrorLogin(false);
                }
                else {
                    console.error('LOGIN FAILED', reply);
                    setErrorLogin(true);
                }
            }
            catch (e) {
                console.log("ERROR LOGGGING IN : ", e)
            }
        }
    }

    return (
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Row style={{ width: '30%' }}>
                <Col>
                    <div style={{ marginBottom: 15 }}>
                        LOGIN
                    </div>

                    {errorLogin && (
                        <Card className="mb-4" bg="danger" text="white" style={{ maxWidth: '300px' }}>
                            <Card.Header>Error</Card.Header>
                            <Card.Body>
                                <Card.Text>Invalid username or password. Please try again.</Card.Text>
                            </Card.Body>
                        </Card>
                    )}

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
        </Container>

    )
}