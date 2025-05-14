import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    blood_type: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        blood_type: user.blood_type || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Only send updatable fields
      const updateData = {
        name: formData.name,
        contact_number: formData.contact_number,
        blood_type: formData.blood_type,
        address: formData.address
      };

      const response = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Profile updated successfully!');
      
      // Update auth context with new data
      login({
        token,
        user: {
          ...user,
          ...updateData
        }
      });
      
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) return <Alert variant="warning">Loading profile...</Alert>;

  return (
    <div className="profile-form p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="mb-4">My Profile</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength="2"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={formData.email}
            readOnly
            plaintext
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            pattern="[0-9]{10}"
            title="Please enter a 10-digit phone number"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Blood Type *</Form.Label>
          <Form.Select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            required
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">Updating...</span>
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Profile;