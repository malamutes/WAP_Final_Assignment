import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from 'react';
import type { Post_Type } from '../../../types/types';
import { Card, Button, Badge, Container } from 'react-bootstrap';
import { useUserContext } from "../../../context/userContext";

const PostDetail = () => {
    const { postID } = useParams();
    console.log(postID)
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post_Type | null>(null);
    const [subscribed, setSubscribed] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);

    const handleEdit = (postID: string) => {
        navigate(`/post/edit/${postID}`); // Navigate to edit post page
    };

    useEffect(() => {
        const fetchPost = async () => {
            const getPost = await fetch(`http://localhost:3000/post/getPost?postID=${postID}`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            const post = await getPost.json();
            if (getPost.ok) {
                console.log(post)
                setIsAuthor(post.isAuthor);
                setPost(post.post)
                setSubscribed(post.isSubscribed)
            }
            else {
                console.log("ERROR GETTING SINGULAR POST ", post.message)
            }

        };

        fetchPost();
    }, [postID]);

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

    const handleSubscribe = async (author: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            // Send delete request to your server
            const response = await fetch(`http://localhost:3000/profile/subscribe/${author}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

            const reply = await response.json();
            if (response.ok) {
                navigate('/subscription');
            } else {
                alert(reply.message)
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting post');
        }
    }

    const handleUnsubscribe = async (author: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            // Send delete request to your server
            const response = await fetch(`http://localhost:3000/profile/subscribe/${author}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

            const reply = await response.json();
            if (response.ok) {
                navigate('/subscription');
            } else {
                alert(reply.message)
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting post');
        }
    }

    if (!post) {
        return <Container style={{ maxWidth: '50%' }}>
            NO POST FOUND
        </Container>
    }

    const formattedDate = new Date(post.date).toLocaleDateString();

    return (
        <Container style={{ maxWidth: '50%' }}>
            <Card className="shadow-sm">
                <Card.Body>
                    <Card.Title as="h2">{post.title}</Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <span>
                                By <a href={`/profile/${post.author}`}>{post.author}</a>
                            </span>
                            {subscribed
                                ?
                                (
                                    <Button variant="danger" size="sm"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleUnsubscribe(post.author, e)}>
                                        Unsubscribe
                                    </Button>
                                )
                                :
                                (
                                    <Button variant="success" size="sm" onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleSubscribe(post.author, e)}>
                                        Subscribe
                                    </Button>
                                )}

                            <span>— Published on {formattedDate}</span>
                        </div>
                    </Card.Subtitle>

                    <Card.Text className="mt-3">{post.content}</Card.Text>

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

                    {user && post.author === user.username && (
                        <div style={{ marginTop: '10px' }}>
                            <Button variant="primary" onClick={() => handleEdit(post._id)}>
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                style={{ marginLeft: '10px' }}
                                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                                    handleDeletePost(post._id, e)
                                }
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>

    );
};

export default PostDetail;
