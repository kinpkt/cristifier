'use client'

import { Container, Navbar, Nav } from 'react-bootstrap';

export default function Header()
{
    return (
        <Navbar bg='dark' data-bs-theme='dark'>
        <Container>
          <Navbar.Brand href='/'>Cristifier</Navbar.Brand>
          <Nav className='me-auto'>
            <Nav.Link href='/regtable'>Registration</Nav.Link>
            <Nav.Link href='/scramble'>Scrambles</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
}