import './App.css'
import { Outlet, useNavigate } from 'react-router';
import { Badge, Button, Card, Col, Container, Form, ListGroup, Nav, Navbar, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { UserProvider, useUserContext } from './context/userContext';
import { useSocket } from './context/socketContext';
import { FaBell } from "react-icons/fa";
import { useNotificationContext } from './context/notificationContext';
import { Dropdown } from 'react-bootstrap';

//GOOGLE OAUTH
//NAV BAR UI
//SOCKET

function App() {
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const { socket, connectedUsers } = useSocket();
    const { notifications, setNotification } = useNotificationContext();

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        try {
            const logout = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
                credentials: 'include'
            });


            if (logout.ok) {
                if (socket) {
                    socket?.disconnect();
                }
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

    useEffect(() => {
        console.log(user)
    }, [])

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="xl" style={{ padding: 15 }}>
                <Container style={{ justifyContent: 'space-between' }}>
                    <Navbar.Brand href="/">MyApp</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href={`/profile/${user?.username}`}>My Profile</Nav.Link>
                            <Nav.Link href="/subscription">My Subscriptions</Nav.Link>
                            <Nav.Link href="/post/myPosts">My Posts</Nav.Link>
                            {user && <Nav.Link href="/post/create">New Post</Nav.Link>}
                        </Nav>

                        <Row className="align-items-center text-white">
                            {user ? (
                                <>
                                    <Col>
                                        <Dropdown align="end" className="position-relative">
                                            <Dropdown.Toggle variant="link" bsPrefix="p-0 border-0 text-white">
                                                <FaBell size={20} />
                                                {notifications.length > 0 && (
                                                    <span
                                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                                        style={{ fontSize: '0.6rem' }}
                                                    >
                                                        {notifications.length}
                                                    </span>
                                                )}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', minWidth: '250px' }}>
                                                {notifications.length === 0 ? (
                                                    <Dropdown.ItemText>No new notifications</Dropdown.ItemText>
                                                ) : (
                                                    notifications.map((notif, index) => (
                                                        <Dropdown.Item key={index} href={`/post/${notif.postId}`}>
                                                            <small className="text-muted">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </small>
                                                        </Dropdown.Item>
                                                    ))
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Col>

                                    <Col>{user.username}</Col>
                                    <Col>{user._id}</Col>
                                    <Col>
                                        <Button variant="danger" onClick={handleLogout}>
                                            LOGOUT
                                        </Button>
                                    </Col>
                                </>
                            ) : (
                                <>
                                    <Col>
                                        <Button variant="success" onClick={() => navigate("/login")}>
                                            LOGIN
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button variant="primary" onClick={() => navigate("/register")}>
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
