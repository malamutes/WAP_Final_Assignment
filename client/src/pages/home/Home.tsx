import { useEffect, useState } from "react"
import type { Post_Type } from "../../types/types";
import { Badge, Button, Card, Col, Container, Form, Row, Stack } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useSocket } from "../../context/socketContext";

export default function Home() {
    const [allPosts, setAllPosts] = useState<Post_Type[]>([]);
    const { socket, connectedUsers, connected } = useSocket();
    const [searchTerm, setSearchTerm] = useState("");

    const truncateContent = (content: string, length: number) => {
        if (content.length > length) {
            return content.slice(0, length) + '...';
        }
        return content;
    };

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/post/search?searchQuery=${searchTerm}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })

            const reply = await response.json();
            if (response.ok) {
                //console.log(reply);
                navigate(`/search?search=${encodeURIComponent(searchTerm)}`, {
                    state: { searchData: reply }
                });
            }
            else {
                navigate(`/search?search=${encodeURIComponent(searchTerm)}`, {
                    state: { searchData: { title: "NO SEARCH RESULTS", posts: [], message: searchTerm } }
                });
            }
        }
        catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        const getBlogPosts = async () => {
            try {
                const getPosts = await fetch('http://localhost:3000/post/all', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (getPosts.ok) {
                    const posts = await getPosts.json();
                    //console.log(posts)
                    setAllPosts(posts.posts)
                }
                else {
                    console.error('RETRIEVING ALL POSTS FAILED');
                }
            }
            catch (e) {
                console.log("ERROR GETTING POSTS FOR MAIN HOME PAGE  : ", e)
            }
        }

        getBlogPosts();
    }, [])

    return (
        <Row>
            {/* Connected Users */}
            <Col xs={12} xl={3} className="d-flex flex-column align-items-center">
                <div className="mt-4 ms-xl-3 me-xl-0 me-3" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                    <h5>Connected Users</h5>
                    {connectedUsers.length === 0 ? (
                        <p>{connected ? "No users connected" : "You need to be logged in."} </p>
                    ) : (
                        connectedUsers.map((user) => (
                            <Card key={user.socketId} className="mb-3">
                                <Card.Body>
                                    <Card.Title as="span" style={{ fontWeight: 'bold', fontSize: 20 }}>
                                        User:{" "}
                                        <a href={`/profile/${user.username}`}>
                                            {user.username}
                                        </a>
                                    </Card.Title>
                                    <Card.Text>
                                        Socket ID: <code>{user.socketId}</code>
                                    </Card.Text>
                                    <Badge bg="secondary">User ID: {user.userId}</Badge>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </div>
            </Col>

            <Col
                xl={{ span: 3, order: 3 }}
                xs={{ span: 12, order: 2 }}
                className="d-flex flex-column align-items-center"
            >
                <div className="mt-4 ms-xl-3 me-xl-5 me-3 text-center" style={{ width: '100%', maxWidth: 500 }}>
                    <h5>Search</h5>
                    <Form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search by tags or blog name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2"
                            style={{ maxWidth: '100%', textAlign: 'center' }}
                        />
                        <Button type="submit" variant="primary" className="mt-2">
                            Search
                        </Button>
                    </Form>
                </div>
            </Col>

            {/* All Posts */}
            <Col xl={{ span: 6, order: 2 }} xs={{ span: 12, order: 3 }}>
                <Container
                    className="mt-4"
                    style={{ overflowY: 'auto', paddingLeft: "5%", paddingRight: '5%' }}
                    fluid="sm"
                >
                    <Stack style={{ gap: 25 }}>
                        {allPosts.map((posts) => (
                            <Row key={posts.date + posts.title} style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/post/${posts._id}`)}>
                                <Card className="text-center">
                                    <Card.Header>{posts.author}</Card.Header>
                                    <Card.Body>
                                        <Card.Title>{posts.title}</Card.Title>
                                        <Card.Text>
                                            {truncateContent(posts.content, 50)}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer className="text-muted">
                                        {posts.tags.map((tag) => tag + ", ")}
                                    </Card.Footer>
                                </Card>
                            </Row>
                        ))}
                    </Stack>
                </Container>
            </Col>
        </Row>


    )
}