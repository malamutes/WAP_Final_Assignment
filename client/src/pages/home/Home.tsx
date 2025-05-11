import { useEffect, useState } from "react"
import type { Post_Type } from "../../types/types";
import { Card, Col, Container, Row, Stack } from "react-bootstrap";
import { useNavigate } from "react-router";

export default function Home() {
    const [allPosts, setAllPosts] = useState<Post_Type[]>([]);

    const truncateContent = (content: string, length: number) => {
        if (content.length > length) {
            return content.slice(0, length) + '...';
        }
        return content;
    };

    const navigate = useNavigate();

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
        <Container style={{ overflowY: 'auto', paddingLeft: "10%", paddingRight: '10%' }}
            fluid="sm" >
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
                            <Card.Footer className="text-muted">{posts.tags.map((tags) => tags + ", ")}</Card.Footer>
                        </Card>
                    </Row>
                ))}
            </Stack>
        </Container>

    )
}