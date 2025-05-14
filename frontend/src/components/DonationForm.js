import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Spinner, Form, Button } from 'react-bootstrap';

const DonationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organs, setOrgans] = useState([]);
  const [formData, setFormData] = useState({
    organ_id: '',
    donation_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrgans = async () => {
      try {
        const response = await axios.get('/api/organs');
        setOrgans(response.data);
      } catch (error) {
        setError('Failed to load organ list');
      }
    };
    fetchOrgans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/donations', {
        ...formData,
        donor_id: user.id
      });
      
      // Redirect to My Donations with success state
      navigate('/my-donations', { 
        state: { 
          success: true,
          newDonation: response.data 
        } 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Register Organ Donation</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Organ</Form.Label>
          <Form.Select
            value={formData.organ_id}
            onChange={(e) => setFormData({...formData, organ_id: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Select an organ</option>
            {organs.map(organ => (
              <option key={organ.id} value={organ.id}>{organ.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Donation Date</Form.Label>
          <Form.Control
            type="date"
            value={formData.donation_date}
            onChange={(e) => setFormData({...formData, donation_date: e.target.value})}
            required
            disabled={loading}
            max={new Date().toISOString().split('T')[0]}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Submit Donation'}
        </Button>
      </Form>
    </div>
  );
};

export default DonationForm;