import { useLocation, useSearchParams } from "react-router";
import type { Post_Type } from "../../types/types";
import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";

export default function Search() {
    const [searchResults, setSearchResults] = useState<{
        posts: Post_Type[],
        title: string,
        message: string
    }>({
        posts: [],
        title: "",
        message: ""
    });

    const location = useLocation();
    console.log(location)

    const [searchParams] = useSearchParams();
    const query = searchParams.get("search") || "";

    useEffect(() => {
        // Fetch only if there's no passed state OR the query has changed
        const fetchResults = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/post/search?searchQuery=${encodeURIComponent(query)}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: { Accept: "application/json" },
                    }
                );

                const reply = await response.json();

                if (response.ok) {
                    setSearchResults(reply);
                } else {
                    console.error("Search error:", reply.message);
                    setSearchResults({ title: query, posts: [], message: "NO SEARCH RESULTS" });
                }
            } catch (error) {
                console.error("Network error:", error);
                setSearchResults({ title: query, posts: [], message: "NO SEARCH RESULTS" });
            }
        };

        // If we navigated here with location.state, use that instead of fetching
        if (location.state?.searchData) {
            setSearchResults(location.state.searchData);
        } else {
            fetchResults();
        }
    }, [query]); // only depend on query

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Search results for: <em>{searchResults.message}</em></h2>

            {searchResults.posts.length === 0 ? (
                <Alert variant="warning">No posts found for "{searchResults.message}".</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {searchResults.posts.map((post) => (
                        <Col key={post._id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title>{post.title}</Card.Title>
                                    <Card.Text>{post.content}</Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-muted small">
                                    Author: {post.author}<br />
                                    Date: {new Date(post.date).toLocaleString()}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}