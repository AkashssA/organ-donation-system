import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/statistics');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return null;

  const getDonationCount = (status) => {
    const item = stats.donations.find(d => d.status === status);
    return item ? item.count : 0;
  };

  const getRequestCount = (status) => {
    const item = stats.requests.find(r => r.status === status);
    return item ? item.count : 0;
  };

  return (
    <Row className="mb-4">
      <Col md={6} className="mb-3">
        <Card>
          <Card.Header>Donations</Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <Card.Text>Pending: {getDonationCount('pending')}</Card.Text>
              </Col>
              <Col>
                <Card.Text>Approved: {getDonationCount('approved')}</Card.Text>
              </Col>
              <Col>
                <Card.Text>Transplanted: {getDonationCount('transplanted')}</Card.Text>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={6} className="mb-3">
        <Card>
          <Card.Header>Requests</Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <Card.Text>Pending: {getRequestCount('pending')}</Card.Text>
              </Col>
              <Col>
                <Card.Text>Matched: {getRequestCount('matched')}</Card.Text>
              </Col>
              <Col>
                <Card.Text>Transplanted: {getRequestCount('transplanted')}</Card.Text>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={12}>
        <Card>
          <Card.Header>Organ Donation Stats</Card.Header>
          <Card.Body>
            <Row>
              {stats.organs.map(organ => (
                <Col key={organ.name} md={4} className="mb-2">
                  <Card.Text>
                    {organ.name}: {organ.donation_count} donations
                  </Card.Text>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Statistics;