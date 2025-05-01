import { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const endpoint = user.role === 'donor' ? '/api/my-donations' : '/api/all-donations';
        const response = await axios.get(`http://localhost:5000${endpoint}`);
        setDonations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch donations');
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user.role]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      transplanted: 'info'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Organ</th>
          <th>Donation Date</th>
          <th>Status</th>
          {user.role !== 'donor' && <th>Donor</th>}
          {user.role !== 'donor' && <th>Blood Type</th>}
        </tr>
      </thead>
      <tbody>
        {donations.map(donation => (
          <tr key={donation.id}>
            <td>{donation.organ_name}</td>
            <td>{new Date(donation.donation_date).toLocaleDateString()}</td>
            <td>{getStatusBadge(donation.status)}</td>
            {user.role !== 'donor' && <td>{donation.donor_name}</td>}
            {user.role !== 'donor' && <td>{donation.blood_type}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DonationList;