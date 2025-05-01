import { useState, useEffect } from 'react';
import { Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const OrganList = ({ onSelect }) => {
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrgans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/organs');
        setOrgans(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch organs');
        setLoading(false);
      }
    };

    fetchOrgans();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {organs.map(organ => (
          <tr key={organ.id}>
            <td>{organ.name}</td>
            <td>{organ.description}</td>
            <td>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onSelect(organ.id)}
              >
                Select
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrganList;