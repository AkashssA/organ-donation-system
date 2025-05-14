import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RequestForm = () => {
  const { user } = useAuth();
  const [organs, setOrgans] = useState([]);
  const [formData, setFormData] = useState({
    organ_id: '',
    urgency_level: 'medium'
  });

  useEffect(() => {
    const fetchOrgans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/organs');
        setOrgans(response.data);
      } catch (error) {
        console.error('Error fetching organs:', error);
      }
    };
    fetchOrgans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests', {
        ...formData,
        recipient_id: user.id
      });
      alert('Request submitted successfully!');
      setFormData({ organ_id: '', urgency_level: 'medium' });
    } catch (error) {
      console.error('Request error:', error);
      alert(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Request Organ</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Organ Needed</label>
          <select 
            className="form-select"
            value={formData.organ_id}
            onChange={(e) => setFormData({...formData, organ_id: e.target.value})}
            required
          >
            <option value="">Select an organ</option>
            {organs.map(organ => (
              <option key={organ.id} value={organ.id}>{organ.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Urgency Level</label>
          <select
            className="form-select"
            value={formData.urgency_level}
            onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestForm;