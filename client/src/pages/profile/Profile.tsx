import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap"
import { useNavigate, useParams } from "react-router";
import type { Post_Type } from "../../types/types";
import { useUserContext } from "../../context/userContext";

export default function Profile() {
    const { profileID } = useParams();
    const navigate = useNavigate();
    console.log(profileID)
    //ITS USING USER NAME NOT ID I CBA CHANGING NAME
    const [profile, setProfile] = useState<{
        _id: string,
        username: string,
        createdAt: string
    } | null>(null);

    const [posts, setPosts] = useState<Post_Type[]>([]);
    const { user } = useUserContext();

    useEffect(() => {
        const fetchProfile = async () => {
            const getProfile = await fetch(`http://localhost:3000/profile?profileID=${profileID}`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (getProfile.ok) {
                const Profile = await getProfile.json();
                setProfile(Profile.profile[0]);
                setPosts(Profile.profilePosts)
                console.log(Profile)
            }
            else {
                console.log("ERROR GETTING SINGULAR Profile ")
            }

        };

        fetchProfile();
    }, [profileID]);

    const handleDeletePost = async (postID: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            // Send delete request to your server
            const response = await fetch(`http://localhost:3000/post/delete/${postID}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

            if (response.ok) {
                navigate('/post/myPosts')
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting post');
        }
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, postID: string) => {
        e.stopPropagation();
        navigate(`/post/edit/${postID}`); // Navigate to edit post page
    };

    return (
        <>
            <Container className="mt-5">
                <h1>{profile?.username}'s Profile</h1>
                <p>Total Posts: {posts.length}</p>
                <p>Date Joined: {profile?.createdAt}</p>

                <Row>
                    {posts.map((post) => (
                        <Col sm={12} md={6} lg={4} key={post._id}>
                            <Card className="mb-4" style={{ cursor: 'pointer' }} onClick={() => navigate(`/post/${post._id}`)}>
                                <Card.Body>
                                    <Card.Title>{post.title}</Card.Title>
                                    <Card.Text>{post.content.substring(0, 100)}...</Card.Text>
                                    {post.tags?.length > 0 && (
                                        <div className="mb-3">
                                            <strong>Tags: </strong>
                                            {post.tags.map((tag, index) => (
                                                <Badge bg="secondary" className="me-1" key={index}>
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <Card.Footer className="text-muted">
                                        Published on {new Date(post.date).toLocaleDateString()}
                                    </Card.Footer>
                                </Card.Body>

                                {user && post.author === user.username && (
                                    <div style={{ marginTop: '10px' }}>
                                        <Button
                                            variant="primary"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleEdit(e, post._id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            style={{ marginLeft: '10px' }}
                                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleDeletePost(post._id, e)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}

                            </Card>

                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    )
}