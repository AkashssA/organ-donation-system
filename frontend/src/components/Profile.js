import { useState, useEffect } from 'react';
import { Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contact_number: '',
    blood_type: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        blood_type: user.blood_type || '',
        address: user.address || ''
      });
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="warning" className="m-4">
        Please log in to view your profile.
      </Alert>
    );
  }

  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'hospital':
        return 'primary';
      case 'donor':
        return 'success';
      case 'recipient':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Card.Header className="profile-header">
          <div className="profile-avatar">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{profileData.name || 'Not provided'}</h2>
          <Badge bg={getRoleBadgeVariant(user.role)} className="role-badge">
            {user.role?.toUpperCase()}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          <div className="profile-section">
            <h5>Contact Information</h5>
            <div className="profile-info">
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <span>{profileData.email}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-phone"></i>
                <span>{profileData.contact_number || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{profileData.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h5>Medical Information</h5>
            <div className="profile-info">
              <div className="info-item">
                <i className="fas fa-tint"></i>
                <span>Blood Type: {profileData.blood_type || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h5>Account Information</h5>
            <div className="profile-info">
              <div className="info-item">
                <i className="fas fa-user"></i>
                <span>User ID: {user.id}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-shield-alt"></i>
                <span>Account Status: Active</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;