import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Outlet, useSearchParams } from 'react-router';

export default function Post() {
    const [searchParams] = useSearchParams();

    console.log(searchParams);

    return (
        <>
            <Outlet />
        </>
    )
}