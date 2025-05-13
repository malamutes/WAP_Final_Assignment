import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Stack } from "react-bootstrap";
import type { Post_Type } from "../../types/types";
import { useNavigate } from "react-router";
import { useUserContext } from "../../context/userContext";


export default function MyPosts() {
    const [allPosts, setAllPosts] = useState<Post_Type[]>([]);
    const { user } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        const getBlogPosts = async () => {
            try {
                const getPosts = await fetch('http://localhost:3000/post/userPosts', {
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
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
            {allPosts.length === 0 ? (
                <Container>
                    NO POSTS FOUND
                </Container>
            ) : (
                <Container
                    style={{ overflowY: 'auto', paddingLeft: '10%', paddingRight: '10%' }}
                    fluid="sm"
                >
                    <Stack style={{ gap: 25 }}>
                        {allPosts.map((post) => (
                            <Row
                                key={post.date + post.title}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/post/${post._id}`)}
                            >
                                <Card className="text-center">
                                    <Card.Header>{post.author}</Card.Header>
                                    <Card.Body>
                                        <Card.Title>{post.title}</Card.Title>
                                        <Card.Text>{post.content}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer className="text-muted">
                                        {post.tags.map((tag, index) => (
                                            <span key={index}>
                                                {tag}
                                                {index < post.tags.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}

                                        {/* Conditional buttons for Edit and Delete */}
                                        {user && post.author === user.username && (
                                            <div style={{ marginTop: '10px', zIndex: 10 }}>
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
                                    </Card.Footer>
                                </Card>
                            </Row>
                        ))}
                    </Stack>
                </Container>
            )}
        </>
    );

}