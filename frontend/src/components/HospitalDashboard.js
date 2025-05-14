import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Tab, Tabs, Table, Button, Spinner, Alert, Form } from 'react-bootstrap';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [donationsRes, requestsRes] = await Promise.all([
          axios.get('/api/all-donations'),
          axios.get('/api/all-requests')
        ]);
        setDonations(donationsRes.data);
        setRequests(requestsRes.data);
      } catch (error) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (type, id) => {
    try {
      setLoading(true);
      await axios.put(`/api/${type}/${id}`, {
        status: 'approved',
        hospital_id: user.id
      });
      
      if (type === 'donations') {
        setDonations(donations.map(d => 
          d.id === id ? {...d, status: 'approved', hospital_id: user.id} : d
        ));
      } else {
        setRequests(requests.map(r => 
          r.id === id ? {...r, status: 'approved', hospital_id: user.id} : r
        ));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'hospital') {
    return <Alert variant="danger">Unauthorized access</Alert>;
  }

  return (
    <div className="container mt-4">
      <h2>Hospital Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="donations" className="mb-3">
        <Tab eventKey="donations" title="Pending Donations">
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Organ</th>
                  <th>Donor</th>
                  <th>Blood Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.filter(d => d.status === 'pending').map(donation => (
                  <tr key={donation.id}>
                    <td>{donation.organ_name}</td>
                    <td>{donation.donor_name}</td>
                    <td>{donation.blood_type}</td>
                    <td>{new Date(donation.donation_date).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleApprove('donations', donation.id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
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
                  <th>Blood Type</th>
                  <th>Urgency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.filter(r => r.status === 'pending').map(request => (
                  <tr key={request.id}>
                    <td>{request.organ_name}</td>
                    <td>{request.recipient_name}</td>
                    <td>{request.blood_type}</td>
                    <td>
                      <span className={`badge bg-${
                        request.urgency_level === 'critical' ? 'danger' :
                        request.urgency_level === 'high' ? 'warning' : 'info'
                      }`}>
                        {request.urgency_level}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleApprove('requests', request.id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default HospitalDashboard;