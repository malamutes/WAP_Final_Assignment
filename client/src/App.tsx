import './App.css'
import { Outlet, useNavigate } from 'react-router';
import { Button, Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { useContext } from 'react';
import { UserProvider, useUserContext } from './context/userContext';

function App() {
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        try {
            const logout = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });


            if (logout.ok) {
                setUser(null);
                navigate('/');
                console.log("LOGOUT SUCCESSFUL!");
            }
            else {
                console.error('LOGOUT FAILED');
            }
        }
        catch (e) {
            console.log("ERROR LOGOUT : ", e)
        }
    }

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="md" style={{ padding: 15 }}>
                <Container style={{ justifyContent: 'space-between' }}>
                    <Navbar.Brand href="/">MyApp</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/login">My Profile</Nav.Link>
                            <Nav.Link href="/register">My Subscriptions</Nav.Link>
                            <Nav.Link href="/post/create">New Post</Nav.Link>
                        </Nav>


                        <Row style={{ color: 'white' }}>
                            {user
                                ?
                                (
                                    <>
                                        <Col style={{ alignContent: 'center' }}>
                                            {user?.username}
                                        </Col>

                                        <Col style={{ alignContent: 'center' }}>
                                            {user?.userId}
                                        </Col>

                                        <Col>
                                            <Button variant='danger' onClick={handleLogout}>
                                                LOGOUT
                                            </Button>
                                        </Col>

                                    </>
                                )
                                :
                                (
                                    <>
                                        <Col>
                                            <Button variant='success' onClick={() => navigate('/login')}>
                                                LOGIN
                                            </Button>
                                        </Col>


                                        <Col>
                                            <Button variant='primary' onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => navigate('/register')}>
                                                REGISTER
                                            </Button>
                                        </Col>

                                    </>
                                )}
                        </Row>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div style={{ marginTop: 50 }}>
                <Outlet />
            </div>

        </>
    )
}

export default App
