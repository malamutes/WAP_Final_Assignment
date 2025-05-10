import './App.css'
import { Outlet } from 'react-router';
import { Container, Nav, Navbar } from 'react-bootstrap';

function App() {

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" style={{ maxHeight: '10%' }}>
        <Container>
          <Navbar.Brand href="/">MyApp</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/register">Register</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div style={{
        width: '100%', height: '90%', display: 'flex',
        justifyContent: 'center', alignItems: 'center'
      }}>
        <Outlet />
      </div>
    </>
  )
}

export default App
