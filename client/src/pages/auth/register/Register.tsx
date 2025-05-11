import { useEffect, useState } from "react";
import { Button, Col, Container, FloatingLabel, Form, Row } from "react-bootstrap";
import { useUserContext } from "../../../context/userContext";
import { useNavigate } from "react-router";

export default function Register() {
    const [username, setUsername] = useState("");
    const [userpassword, setUserPassword] = useState("");
    const [confirmUserPassword, setConfirmUserPassword] = useState("");
    const [validatedUser, setValidatedUser] = useState(true);
    const [validatedPass, setValidatedPass] = useState(true);
    const [validatedSamePass, setValidatedSamePass] = useState(true);
    const [initial, setInitial] = useState(true); // to track the first submit attempt
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    // Validate input as the user types
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);

        // Reset validation on change
        if (value.length >= 6 && value.length <= 30) {
            setValidatedUser(true);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserPassword(value);

        // Reset validation on change
        if (value.length >= 6 && value.length <= 30) {
            setValidatedPass(true);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmUserPassword(value);

        // Reset validation if passwords match
        if (value === userpassword) {
            setValidatedSamePass(true);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setInitial(false); // Trigger validation messages

        // Validate inputs
        let valid = true;

        if (username.length < 6 || username.length > 30) {
            setValidatedUser(false);
            valid = false;
        }

        if (userpassword.length < 6 || userpassword.length > 30) {
            setValidatedPass(false);
            valid = false;
        }

        if (userpassword !== confirmUserPassword) {
            setValidatedSamePass(false);
            valid = false;
        }

        if (!valid) return; // Prevent form submission if any validation fails

        try {
            const RegisterInfo = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, userpassword: userpassword, confirmUserPassword: confirmUserPassword }),
                credentials: 'include'
            });

            const reply = await RegisterInfo.json();
            if (RegisterInfo.ok) {
                console.log("Register SUCCESSFUL!");
                setUser(reply.user);
                navigate('/');

            } else {
                console.error('Register FAILED', reply.message);
            }
        } catch (e) {
            console.log("ERROR LOGGING IN : ", e);
        }
    };

    return (
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Row style={{ width: '30%' }}>
                <Col>
                    <div style={{ marginBottom: 15 }}>
                        REGISTER
                    </div>
                    <Form onSubmit={handleRegisterSubmit}>
                        <FloatingLabel controlId="floatingInput" label="Username" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={handleUsernameChange}
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
                                onChange={handlePasswordChange}
                                required={true}
                                isInvalid={initial ? false : !validatedPass}
                            />
                            <Form.Control.Feedback type="invalid">
                                Password must be between 6 and 30 characters.
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmUserPassword}
                                onChange={handleConfirmPasswordChange}
                                required={true}
                                isInvalid={initial ? false : !validatedSamePass}
                            />
                            <Form.Control.Feedback type="invalid">
                                Passwords must match!
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        <Button type="submit">Register</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
