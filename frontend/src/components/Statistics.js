import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch statistics');
        setLoading(false);
        console.error('Statistics error:', err);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!stats) {
    return <Alert variant="warning">No statistics available</Alert>;
  }

  const getCount = (items, status) => {
    const item = items.find(i => i.status === status);
    return item ? item.count : 0;
  };

  return (
    <div className="statistics-container">
      <h2 className="mb-4">Organ Donation Statistics</h2>
      
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Donation Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-primary">{getCount(stats.donationCounts, 'pending')}</h3>
                    <p className="text-muted mb-0">Pending Donations</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-success">{getCount(stats.donationCounts, 'approved')}</h3>
                    <p className="text-muted mb-0">Approved Donations</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-info">{getCount(stats.donationCounts, 'transplanted')}</h3>
                    <p className="text-muted mb-0">Transplanted</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Request Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-warning">{getCount(stats.requestCounts, 'pending')}</h3>
                    <p className="text-muted mb-0">Pending Requests</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-info">{getCount(stats.requestCounts, 'matched')}</h3>
                    <p className="text-muted mb-0">Matched Requests</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center p-3">
                    <h3 className="text-success">{getCount(stats.requestCounts, 'transplanted')}</h3>
                    <p className="text-muted mb-0">Transplanted</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-primary">
                      {getCount(stats.donationCounts, 'pending') + getCount(stats.donationCounts, 'approved')}
                    </h3>
                    <p className="text-muted mb-0">Total Active Donations</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-success">
                      {getCount(stats.requestCounts, 'pending') + getCount(stats.requestCounts, 'matched')}
                    </h3>
                    <p className="text-muted mb-0">Total Active Requests</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-info">
                      {getCount(stats.donationCounts, 'transplanted') + getCount(stats.requestCounts, 'transplanted')}
                    </h3>
                    <p className="text-muted mb-0">Total Transplanted</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;