import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaDonate, FaHandHoldingMedical, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const QuickLinks = () => {
  const links = [
    {
      title: 'Donate Blood',
      icon: <FaDonate size={40} className="text-danger mb-3" />,
      description: 'View blood requests and help save lives',
      path: '/donate-blood'
    },
    {
      title: 'Request Blood',
      icon: <FaHandHoldingMedical size={40} className="text-danger mb-3" />,
      description: 'Submit a blood requirement request',
      path: '/request'
    },
    {
      title: 'Register for Campaigns',
      icon: <FaUserPlus size={40} className="text-danger mb-3" />,
      description: 'Join our community of lifesavers',
      path: '/campaigns'
    }
  ];

  return (
    <div className="quick-links py-5 bg-white">
      <Container>
        <Row>
          {links.map((link, index) => (
            <Col md={4} key={index} className="mb-4 mb-md-0">
              <Card 
                as={Link} 
                to={link.path}
                className="text-center h-100 border-0 shadow-sm hover-card text-decoration-none"
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  {link.icon}
                  <Card.Title className="h4 mb-3 text-dark">{link.title}</Card.Title>
                  <Card.Text className="text-muted">{link.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default QuickLinks;
