import { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const endpoint = user.role === 'recipient' ? '/api/my-requests' : '/api/all-requests';
        const response = await axios.get(`http://localhost:5000${endpoint}`);
        setRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user.role]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      matched: 'success',
      transplanted: 'info',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      low: 'success',
      medium: 'primary',
      high: 'warning',
      critical: 'danger'
    };
    return <Badge bg={variants[urgency]}>{urgency}</Badge>;
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Organ</th>
          <th>Urgency</th>
          <th>Status</th>
          {user.role !== 'recipient' && <th>Recipient</th>}
          {user.role !== 'recipient' && <th>Blood Type</th>}
        </tr>
      </thead>
      <tbody>
        {requests.map(request => (
          <tr key={request.id}>
            <td>{request.organ_name}</td>
            <td>{getUrgencyBadge(request.urgency_level)}</td>
            <td>{getStatusBadge(request.status)}</td>
            {user.role !== 'recipient' && <td>{request.recipient_name}</td>}
            {user.role !== 'recipient' && <td>{request.blood_type}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RequestList;