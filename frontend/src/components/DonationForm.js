import { useState } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import OrganList from './OrganList';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DonationForm = ({ show, onHide, onSuccess }) => {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [donationDate, setDonationDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrgan) {
      setError('Please select an organ');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/donations', {
        organ_id: selectedOrgan,
        donation_date: donationDate
      });
      
      setSuccess('Donation registered successfully');
      setError('');
      onSuccess();
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register donation');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Register Organ Donation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <h5>Select Organ to Donate</h5>
        <OrganList onSelect={setSelectedOrgan} />
        
        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Donation Date</Form.Label>
            <Form.Control
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              required
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" disabled={!selectedOrgan}>
            Submit Donation
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DonationForm;