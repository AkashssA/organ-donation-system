import { useState } from 'react';
import { Container, Tabs, Tab, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import DonationForm from '../components/DonationForm';
import RequestForm from '../components/RequestForm';
import DonationList from '../components/DonationList';
import RequestList from '../components/RequestList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDonationSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRequestSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h1>Welcome, {user?.name}</h1>
          <p>Email: {user?.email} | Role: {user?.role}</p>
        </Col>
        <Col className="text-end">
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="donations" className="mb-3">
        {user?.role === 'donor' && (
          <Tab eventKey="donations" title="My Donations">
            <div className="text-end mb-3">
              <Button variant="primary" onClick={() => setShowDonationForm(true)}>
                Register New Donation
              </Button>
            </div>
            <DonationList key={refreshKey} />
          </Tab>
        )}

        {user?.role === 'recipient' && (
          <Tab eventKey="requests" title="My Requests">
            <div className="text-end mb-3">
              <Button variant="primary" onClick={() => setShowRequestForm(true)}>
                Submit New Request
              </Button>
            </div>
            <RequestList key={refreshKey} />
          </Tab>
        )}

        {(user?.role === 'hospital' || user?.role === 'admin') && (
          <>
            <Tab eventKey="pending-donations" title="Pending Donations">
              <DonationList key={refreshKey} />
            </Tab>
            <Tab eventKey="pending-requests" title="Pending Requests">
              <RequestList key={refreshKey} />
            </Tab>
          </>
        )}
      </Tabs>

      {user?.role === 'donor' && (
        <DonationForm 
          show={showDonationForm} 
          onHide={() => setShowDonationForm(false)} 
          onSuccess={handleDonationSuccess}
        />
      )}

      {user?.role === 'recipient' && (
        <RequestForm 
          show={showRequestForm} 
          onHide={() => setShowRequestForm(false)} 
          onSuccess={handleRequestSuccess}
        />
      )}
    </Container>
  );
};

export default Dashboard;