import React from 'react';
import { Container, Row, Col, Card, Button, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Features = () => {
  const events = [
    {
      title: 'Blood Drive at City Hall',
      date: 'August 15, 2025',
      location: 'City Hall Plaza',
      time: '9:00 AM - 4:00 PM'
    },
    {
      title: 'GIMSR VSP Campus Blood Drive',
      date: 'August 20, 2025',
      location: 'Student Center',
      time: '10:00 AM - 3:00 PM'
    }
  ];

  const faqs = [
    {
      question: 'Who can donate blood?',
      answer: 'Most healthy adults who are at least 17 years old and weigh at least 110 pounds can donate blood.'
    },
    {
      question: 'How often can I donate blood?',
      answer: 'You can donate whole blood every 56 days, up to 6 times a year.'
    },
    {
      question: 'How long does it take to donate blood?',
      answer: 'The actual blood donation takes about 8-10 minutes. However, the entire process takes about an hour.'
    },
    {
      question: 'Who can I donate blood to? Or who can donate blood to me?',
      answer: (
        <div>
          <div>Blood type compatibility is crucial for safe blood transfusions. Here's a comprehensive chart:</div>
          <div className="blood-compatibility-chart mb-3">
            <img 
              src="/compactablity chart.jpg" 
              alt="Blood Type Compatibility Chart" 
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <div><strong>Quick Guide:</strong></div>
          <ul>
            <li>Type O- is the universal donor (can give to all types)</li>
            <li>Type AB+ is the universal recipient (can receive from all types)</li>
            <li>Type O can only receive from type O</li>
            <li>Type AB can receive from any type</li>
            <li>RH- can give to both RH- and RH+</li>
            <li>RH+ can only give to RH+</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="features py-5">
      <Container>
        <Row className="mb-5">
          <Col md={4}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src="/blood donation illustration.jpg" 
                alt="Blood Donation Facts" 
              />
              <Card.Body>
                <Card.Title>Did You Know?</Card.Title>
                <Card.Text>
                  <ul className="list-unstyled">
                    <li className="mb-2">🩸 One donation can save up to 3 lives</li>
                    <li className="mb-2">⏰ Every 2 seconds someone needs blood</li>
                    <li className="mb-2">❤️ Blood cannot be manufactured – it can only come from donors</li>
                    <li>🏥 Only 3% of eligible people donate blood</li>
                  </ul>
                </Card.Text>
                <Button 
                  as={Link}
                  to="/donate"
                  variant="danger" 
                  className="mt-2"
                >
                  Start Saving Lives Today
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <h3 className="mb-4">Upcoming Blood Drives</h3>
            {events.map((event, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <Card.Title>{event.title}</Card.Title>
                      <Card.Text>
                        Date: {event.date}<br />
                        Time: {event.time}<br />
                        Location: {event.location}
                      </Card.Text>
                    </Col>
                    <Col md={4} className="text-md-end">
                      <Button variant="outline-danger">KNOW MORE</Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <h3 className="mb-4">Frequently Asked Questions</h3>
            <Accordion>
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Features;
