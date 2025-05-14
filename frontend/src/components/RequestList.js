import { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth(); // Get token directly from useAuth

  useEffect(() => {
    if (!user || !token) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Determine endpoint based on role
        const endpoint = user.role === 'recipient' 
          ? '/api/my-requests' 
          : '/api/all-requests';

        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}` // Use token from context
          }
        });

        setRequests(response.data);
      } catch (err) {
        console.error('Request fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, token]); // Add token to dependencies

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      matched: 'success',
      completed: 'primary',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      low: 'success',
      medium: 'primary',
      high: 'warning',
      critical: 'danger'
    };
    return <Badge bg={variants[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    setRequests([]);
    // Trigger re-fetch by changing state
  };

  if (!user) return <Alert variant="warning">Loading user data...</Alert>;
  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return (
    <Alert variant="danger">
      {error}
      <Button variant="link" onClick={handleRefresh}>Retry</Button>
    </Alert>
  );

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>{user.role === 'recipient' ? 'My Requests' : 'All Requests'}</h4>
        <Button variant="outline-primary" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Alert variant="info">No requests found</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Organ</th>
              <th>Description</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              {user.role !== 'recipient' && <th>Recipient</th>}
              {user.role !== 'recipient' && <th>Blood Type</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{request.organ_name}</td>
                <td>{request.organ_description}</td>
                <td>{getUrgencyBadge(request.urgency_level)}</td>
                <td>{getStatusBadge(request.status)}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                {user.role !== 'recipient' && <td>{request.recipient_name || 'N/A'}</td>}
                {user.role !== 'recipient' && <td>{request.blood_type || 'N/A'}</td>}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default RequestList;