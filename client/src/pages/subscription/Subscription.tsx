import { useEffect, useState } from "react"
import { Button, Card, Container } from "react-bootstrap";
interface SubscribeUser {
    createdAt: Date
    targetUserId: string
    username: string,
}

export default function Subscription() {

    const [subscribedArray, setSubscribedArray] = useState<SubscribeUser[]>([]);

    useEffect(() => {
        const getAllSubscription = async () => {
            const response = await fetch('http://localhost:3000/profile/getAllSubscriptions', {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Accept": 'application/json'
                }
            })

            const reply = await response.json();

            if (response.ok) {
                console.log(reply),
                    setSubscribedArray(reply.subscriptions);
            }
            else {
                console.log(reply.message)
            }
        }
        getAllSubscription();
    }, [])

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
                window.location.reload();
            } else {
                alert(reply.message)
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting post');
        }
    }

    return (
        <>
            <Container className="d-flex flex-wrap">
                {subscribedArray.length === 0 ? (
                    <div>No subscriptions found.</div>
                ) : (
                    subscribedArray.map((subscription, index) => (
                        <Card key={index} className="m-2" style={{ width: '18rem' }}>
                            <Card.Body>
                                <a href={`/profile/${subscription.username}`}>
                                    <Card.Title>{subscription.username}</Card.Title>
                                </a>

                                <Card.Subtitle className="mb-2 text-muted">
                                    {subscription.targetUserId}
                                </Card.Subtitle>
                                <Card.Text>
                                    Created on: {new Date(subscription.createdAt).toLocaleDateString()}
                                </Card.Text>
                                <Button
                                    variant="danger"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleUnsubscribe(subscription.username, e)}
                                >
                                    Unsubscribe
                                </Button>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Container>
        </>
    )
}