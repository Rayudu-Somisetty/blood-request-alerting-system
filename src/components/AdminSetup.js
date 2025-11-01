import React, { useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { initializeAdmins } from '../utils/adminInitializer';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const results = await initializeAdmins();
      
      const successCount = results.filter(r => r.success).length;
      const existingCount = results.filter(r => r.message.includes('already exists')).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        setMessage(`✅ Created ${successCount} admin user(s) successfully!
        
Admin 1: admin@bloodalert.com / admin123
Admin 2: admin@gimsr.edu.in / admin123`);
      } else if (existingCount > 0) {
        setError(`ℹ️ Admin users already exist! You can login with:

Admin 1: admin@bloodalert.com / admin123
Admin 2: admin@gimsr.edu.in / admin123`);
      }
      
      if (errorCount > 0) {
        const errorMessages = results.filter(r => !r.success).map(r => `${r.email}: ${r.message}`).join('\n');
        setError(`❌ Some errors occurred:\n${errorMessages}`);
      }
      
    } catch (error) {
      console.error('Error initializing admins:', error);
      setError(`Error initializing admin users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Card className="mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Admin Setup - Blood Alert</h4>
        </Card.Header>
        <Card.Body>
          <p>Click the button below to create both admin user accounts for your Blood Alert system.</p>
          
          <div className="mb-3">
            <strong>Admin Credentials that will be created:</strong><br />
            <div className="mt-2">
              <strong>Admin 1:</strong><br />
              Email: admin@bloodalert.com<br />
              Password: admin123<br />
              <small className="text-muted">Blood Alert main administrator</small>
            </div>
            <div className="mt-2">
              <strong>Admin 2:</strong><br />
              Email: admin@gimsr.edu.in<br />
              Password: admin123<br />
              <small className="text-muted">GIMSR Blood Bank administrator</small>
            </div>
          </div>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Button 
            variant="primary" 
            onClick={createAdminUser}
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating Admin Users...
              </>
            ) : (
              'Create Admin Users'
            )}
          </Button>

          <div className="mt-3 text-muted small">
            <strong>Note:</strong> This will create an admin user in Firebase Authentication and Firestore. 
            Once created, you can login to the system using the credentials above.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSetup;
