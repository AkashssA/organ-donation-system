import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Spinner, Table, Button } from 'react-bootstrap';

const MyDonations = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get('/api/my-donations');
        setDonations(response.data);
      } catch (err) {
        setError('Failed to fetch donations');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [location.state]); // Re-fetch when location state changes

  if (loading) return <Spinner animation="border" className="m-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Donations</h2>
        <Button variant="primary" onClick={() => navigate('/donate')}>
          New Donation
        </Button>
      </div>

      {location.state?.success && (
        <Alert variant="success" dismissible>
          Donation registered successfully!
        </Alert>
      )}

      {donations.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Organ</th>
              <th>Donation Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => (
              <tr key={donation.id}>
                <td>{donation.organ_name}</td>
                <td>{new Date(donation.donation_date).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${
                    donation.status === 'approved' ? 'success' : 
                    donation.status === 'pending' ? 'warning' : 'secondary'
                  }`}>
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          You haven't made any donations yet. <Button variant="link" onClick={() => navigate('/donate')}>Register your first donation</Button>
        </Alert>
      )}
    </div>
  );
};

export default MyDonations;