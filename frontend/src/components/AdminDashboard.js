import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Tab, Tabs, Table, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';

const AdminDashboard = () => {
  const { user, approveDonation, rejectDonation, approveRequest, rejectRequest, matchDonation } = useAuth();
  const [activeTab, setActiveTab] = useState('donations');
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [donationsRes, requestsRes, hospitalsRes] = await Promise.all([
          axios.get('/api/all-donations'),
          axios.get('/api/all-requests'),
          axios.get('/api/users?role=hospital')
        ]);
        setDonations(donationsRes.data);
        setRequests(requestsRes.data);
        setHospitals(hospitalsRes.data);
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveDonation = async (donationId) => {
    try {
      await approveDonation(donationId, selectedHospital || user.id);
      setDonations(donations.map(d => 
        d.id === donationId ? {...d, status: 'approved', hospital_id: selectedHospital || user.id} : d
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectDonation = async (donationId) => {
    try {
      await rejectDonation(donationId);
      setDonations(donations.map(d => 
        d.id === donationId ? {...d, status: 'rejected'} : d
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveRequest(requestId, user.id);
      setRequests(requests.map(r => 
        r.id === requestId ? {...r, status: 'approved', hospital_id: user.id} : r
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectRequest(requestId);
      setRequests(requests.map(r => 
        r.id === requestId ? {...r, status: 'rejected'} : r
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMatch = async () => {
    try {
      await matchDonation(selectedDonation, selectedRequest);
      setDonations(donations.map(d => 
        d.id === selectedDonation ? {...d, status: 'matched'} : d
      ));
      setRequests(requests.map(r => 
        r.id === selectedRequest ? {...r, status: 'matched'} : r
      ));
      setShowMatchModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  if (user?.role !== 'admin') {
    return <Alert variant="danger">Unauthorized access</Alert>;
  }

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="donations" title="Pending Donations">
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Organ</th>
                  <th>Donor</th>
                  <th>Date</th>
                  <th>Blood Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.filter(d => d.status === 'pending').map(donation => (
                  <tr key={donation.id}>
                    <td>{donation.organ_name}</td>
                    <td>{donation.donor_name}</td>
                    <td>{new Date(donation.donation_date).toLocaleDateString()}</td>
                    <td>{donation.blood_type}</td>
                    <td>
                      <Form.Select 
                        size="sm" 
                        className="mb-2"
                        onChange={(e) => setSelectedHospital(e.target.value)}
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </Form.Select>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleApproveDonation(donation.id)}
                          disabled={!selectedHospital && user.role !== 'hospital'}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRejectDonation(donation.id)}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => {
                            setSelectedDonation(donation.id);
                            setShowMatchModal(true);
                          }}
                        >
                          Match
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="requests" title="Pending Requests">
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Organ</th>
                  <th>Recipient</th>
                  <th>Urgency</th>
                  <th>Blood Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.filter(r => r.status === 'pending').map(request => (
                  <tr key={request.id}>
                    <td>{request.organ_name}</td>
                    <td>{request.recipient_name}</td>
                    <td>
                      <span className={`badge bg-${
                        request.urgency_level === 'critical' ? 'danger' :
                        request.urgency_level === 'high' ? 'warning' : 'info'
                      }`}>
                        {request.urgency_level}
                      </span>
                    </td>
                    <td>{request.blood_type}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* Match Modal */}
      <Modal show={showMatchModal} onHide={() => setShowMatchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Match Donation to Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Request to Match</Form.Label>
            <Form.Select 
              value={selectedRequest || ''}
              onChange={(e) => setSelectedRequest(e.target.value)}
            >
              <option value="">Select a request</option>
              {requests.filter(r => r.status === 'pending').map(request => (
                <option key={request.id} value={request.id}>
                  {request.organ_name} (Blood: {request.blood_type}, Urgency: {request.urgency_level})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Select Hospital</Form.Label>
            <Form.Select 
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              <option value="">Select hospital</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMatchModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMatch}
            disabled={!selectedRequest || !selectedHospital}
          >
            Confirm Match
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;