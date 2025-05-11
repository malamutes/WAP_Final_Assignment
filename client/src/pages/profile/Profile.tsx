import { useEffect, useState } from "react";
import { Badge, Card, Col, Container, Row } from "react-bootstrap"
import { useParams } from "react-router";
import type { Post_Type } from "../../types/types";

export default function Profile() {
    const { profileID } = useParams();
    console.log(profileID)
    //ITS USING USER NAME NOT ID I CBA CHANGING NAME
    const [profile, setProfile] = useState<{
        _id: string,
        username: string,
        createdAt: string
    } | null>(null);

    const [posts, setPosts] = useState<Post_Type[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const getProfile = await fetch(`http://localhost:3000/profile?profileID=${profileID}`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
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

    return (
        <>
            <Container className="mt-5">
                <h1>{profile?.username}'s Profile</h1>
                <p>Total Posts: {posts.length}</p>
                <p>Date Joined: {profile?.createdAt}</p>

                <Row>
                    {posts.map((post) => (
                        <Col sm={12} md={6} lg={4} key={post._id}>
                            <Card className="mb-4">
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

                            </Card>

                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    )
}