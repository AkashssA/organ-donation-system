import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaLock, FaEnvelope, FaHandHoldingHeart, FaUserPlus } from 'react-icons/fa';

// Import your images
import firstImage from '../images/first.jpg';
import donateImage from '../images/donateee.jpg';
import requestImage from '../images/request.jpg';
import donationImage from '../images/donation.jpg';

const sliderImages = [
  {
    id: 1,
    src: firstImage,
    alt: 'Organ Donation',
    title: 'Be a Life Saver',
    description: 'One organ donor can save up to 8 lives and enhance 75 more'
  },
  {
    id: 2,
    src: donateImage,
    alt: 'Donate Organs',
    title: 'Give the Gift of Life',
    description: 'Your decision to donate can give someone a second chance at life'
  },
  {
    id: 3,
    src: requestImage,
    alt: 'Request Organs',
    title: 'Find Your Match',
    description: 'Connect with potential donors and recipients nationwide'
  },
  {
    id: 4,
    src: donationImage,
    alt: 'Donation Process',
    title: 'Simple & Secure Process',
    description: 'Our streamlined system makes organ donation easy and transparent'
  }
];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login({ email, password });
      if (result.success) {
        // Redirect based on user role
        const redirectPath = {
          admin: '/admin',
          hospital: '/hospital',
          donor: '/donor',
          recipient: '/recipient'
        }[result.user.role.toLowerCase()] || '/';
        
        navigate(redirectPath);
      } else {
        setError(result.error || 'Failed to login. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={6} className="d-none d-md-flex align-items-center">
          <Card className="border-0 shadow-lg w-100">
            <Carousel 
              activeIndex={index} 
              onSelect={handleSelect} 
              interval={4000} 
              pause={false}
              className="rounded overflow-hidden"
            >
              {sliderImages.map((image) => (
                <Carousel.Item key={image.id}>
                  <img
                    className="d-block w-100"
                    src={image.src}
                    alt={image.alt}
                    style={{ height: '500px', objectFit: 'cover' }}
                  />
                  <Carousel.Caption className="bg-dark bg-opacity-75 rounded p-4">
                    <h3 className="mb-3 fw-bold">{image.title}</h3>
                    <p className="mb-0 fs-5">{image.description}</p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </Card>
        </Col>
        
        <Col md={5} className="px-4">
          <div className="text-center mb-4">
            <div className="logo-container mb-3">
              <FaHeartbeat className="text-primary" style={{ fontSize: '3.5rem' }} />
            </div>
            <h2 className="text-primary fw-bold">Organ Donation System</h2>
            <p className="text-muted fs-5">Login to continue your journey of saving lives</p>
          </div>
          
          <Card className="border-0 shadow-sm p-4">
            <Form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="danger" className="text-center py-2 mb-3">
                  {error}
                </Alert>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label className="text-muted">
                  <FaEnvelope className="me-2" />
                  Email address
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="py-2"
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted">
                  <FaLock className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="py-2"
                  disabled={isLoading}
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 mb-3 fw-bold"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center mb-3">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/forgot-password')}
                  className="text-decoration-none text-muted"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <hr className="flex-grow-1" />
                <span className="px-2 text-muted">or</span>
                <hr className="flex-grow-1" />
              </div>
              
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/register')}
                className="w-100 py-2 fw-bold"
                size="lg"
                disabled={isLoading}
              >
                <FaUserPlus className="me-2" />
                Create New Account
              </Button>
            </Form>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              By logging in, you agree to our{' '}
              <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/terms')}>
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/privacy')}>
                Privacy Policy
              </Button>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;