import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import type { Post_Type } from "../../types/types";

const EditPost = () => {
    const { postID } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post_Type | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            const res = await fetch(`http://localhost:3000/post/getPost?postID=${postID}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                const post = data.post;
                setPost(post);
                setTitle(post.title);
                setContent(post.content);
                setTags(post.tags.join(", "));
            }
        };
        fetchPost();
    }, [postID]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedPost = {
            title,
            content,
            tags: tags.split(",").map(t => t.trim()),
        };

        const res = await fetch(`http://localhost:3000/post/edit/${postID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(updatedPost),
        });

        if (res.ok) {
            navigate(`/post/${postID}`);
        } else {
            alert("Failed to update post.");
        }
    };

    if (!post) {
        return <Container style={{ maxWidth: "50%" }}>Loading post...</Container>;
    }

    return (
        <Container style={{ maxWidth: "50%" }}>
            <h2>Edit Post</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Tags (comma separated)</Form.Label>
                    <Form.Control
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
            </Form>
        </Container>
    );
};

export default EditPost;
