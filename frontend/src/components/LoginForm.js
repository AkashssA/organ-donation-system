import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Carousel, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import your images
import firstImage from '../images/first.jpg';
import donateImage from '../images/donateee.jpg';
import requestImage from '../images/request.jpg';
import donationImage from '../images/donation.jpg';
import logoImage from '../images/logo.png';

const sliderImages = [
  {
    id: 1,
    src: firstImage,
    alt: 'Organ Donation'
  },
  {
    id: 2,
    src: donateImage,
    alt: 'Donate Organs'
  },
  {
    id: 3,
    src: requestImage,
    alt: 'Request Organs'
  },
  {
    id: 4,
    src: donationImage,
    alt: 'Donation Process'
  }
];


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={6} className="d-none d-md-flex align-items-center">
          <Card className="border-0 shadow-lg w-100">
            <Carousel activeIndex={index} onSelect={handleSelect} interval={3000} pause={false}>
              {sliderImages.map((image) => (
                <Carousel.Item key={image.id}>
                  <img
                    className="d-block w-100 rounded"
                    src={image.src}
                    alt={image.alt}
                    style={{ height: '500px', objectFit: 'cover' }}
                  />
                  <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-2">
                    <h5>Welcome to Organ Donation</h5>
                    <p>Help others to Save Others Life</p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </Card>
        </Col>
        
        <Col md={5} className="px-5">
          <div className="text-center mb-4">
            {/* Replace with your actual logo */}
            <div className="logo-container mb-3">
              <img 
                src={logoImage}
                alt="Company Logo" 
                className="img-fluid"
                style={{ maxHeight: '80px' }}
              />
            </div>
            <h2 className="text-primary">Welcome Back</h2>
            <p className="text-muted">Please enter your credentials to login</p>
          </div>
          
          <Card className="border-0 shadow-sm p-4">
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="py-2"
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 mb-3"
                size="lg"
              >
                Login
              </Button>
              
              <div className="text-center mb-3">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/forgot-password')}
                  className="text-decoration-none"
                >
                  Forgot password?
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
                className="w-100 py-2"
                size="lg"
              >
                Create new account
              </Button>
            </Form>
          </Card>
          
          <div className="text-center mt-3 text-muted">
            <small>© {new Date().getFullYear()} Your Company. All rights reserved.</small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;