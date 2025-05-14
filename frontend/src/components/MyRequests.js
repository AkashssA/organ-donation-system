import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Alert, Spinner, Button } from 'react-bootstrap';

const MyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/my-requests');
        setRequests(response.data);
      } catch (err) {
        setError('Failed to fetch requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <Spinner animation="border" className="m-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Organ Requests</h2>
        <Button variant="primary" onClick={() => navigate('/request-organ')}>
          New Request
        </Button>
      </div>

      {requests.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Organ</th>
              <th>Request Date</th>
              <th>Urgency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{request.organ_name}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${
                    request.urgency_level === 'critical' ? 'danger' :
                    request.urgency_level === 'high' ? 'warning' : 'info'
                  }`}>
                    {request.urgency_level}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${
                    request.status === 'matched' ? 'success' :
                    request.status === 'approved' ? 'primary' :
                    request.status === 'pending' ? 'secondary' : 'danger'
                  }`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          You haven't made any requests yet. <Button 
            variant="link" 
            onClick={() => navigate('/request-organ')}
            className="p-0"
          >
            Request an organ now
          </Button>
        </Alert>
      )}
    </div>
  );
};

export default MyRequests;