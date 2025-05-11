import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from 'react';
import type { Post_Type } from '../../../types/types';
import { Card, Button, Badge, Container } from 'react-bootstrap';

const PostDetail = () => {
    const { postID } = useParams();
    console.log(postID)
    const navigate = useNavigate();
    const [post, setPost] = useState<Post_Type | null>(null);
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            const getPost = await fetch(`http://localhost:3000/post/getPost?postID=${postID}`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (getPost.ok) {
                const post = await getPost.json();
                setIsAuthor(post.isAuthor);
                setPost(post.post)
            }
            else {
                console.log("ERROR GETTING SINGULAR POST ")
            }

        };

        fetchPost();
    }, [postID]);

    const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch(`/deletePost/${postID}`, { method: 'DELETE' });
        navigate('/myPosts');
    };

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
                        By <a href={`/profile/${post.author}`}>{post.author}</a> — Published on {formattedDate}
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

                    {isAuthor && (
                        <form onSubmit={handleDelete}>
                            <Button variant="danger" type="submit">
                                Delete Post
                            </Button>
                        </form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PostDetail;
