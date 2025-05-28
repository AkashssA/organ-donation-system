import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MatchingSystem.css';

const MatchingSystem = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Blood group compatibility matrix
  const bloodGroupCompatibility = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes] = await Promise.all([
        axios.get('/api/all-donations'),
        axios.get('/api/all-requests')
      ]);

      // Filter available donations and active requests
      const availableDonations = donationsRes.data.filter(d => d.status === 'available');
      const activeRequests = requestsRes.data.filter(r => r.status === 'pending');

      setDonations(availableDonations);
      setRequests(activeRequests);
      findMatches(availableDonations, activeRequests);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isBloodGroupCompatible = (donorBlood, recipientBlood) => {
    return bloodGroupCompatibility[donorBlood]?.includes(recipientBlood) || false;
  };

  const findMatches = (donations, requests) => {
    const potentialMatches = [];

    donations.forEach(donation => {
      requests.forEach(request => {
        const bloodCompatible = isBloodGroupCompatible(donation.blood_type, request.blood_type);
        
        if (
          donation.organ_name === request.organ_name &&
          bloodCompatible &&
          donation.status === 'available' &&
          request.status === 'pending'
        ) {
          potentialMatches.push({
            donationId: donation.id,
            requestId: request.id,
            organType: donation.organ_name,
            donorBloodType: donation.blood_type,
            recipientBloodType: request.blood_type,
            donorName: donation.donor_name,
            recipientName: request.recipient_name,
            matchScore: calculateMatchScore(donation, request, bloodCompatible)
          });
        }
      });
    });

    potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
    setMatches(potentialMatches);
  };

  const calculateMatchScore = (donation, request, bloodCompatible) => {
    let score = 100;

    if (donation.blood_type === request.blood_type) {
      score += 20;
    }

    const ageDiff = Math.abs(donation.donor_age - request.recipient_age);
    score -= ageDiff * 2;

    if (donation.location !== request.location) {
      score -= 20;
    }

    if (request.urgency_level === 'critical') {
      score += 30;
    } else if (request.urgency_level === 'high') {
      score += 15;
    }

    return Math.max(0, score);
  };

  const handleMatch = async (match) => {
    try {
      // Update donation status
      await axios.put(`/api/donations/${match.donationId}`, {
        status: 'matched',
        matched_with: match.requestId
      });

      // Update request status
      await axios.put(`/api/requests/${match.requestId}`, {
        status: 'matched',
        matched_with: match.donationId
      });

      // Refresh the data
      fetchData();
    } catch (err) {
      setError('Failed to create match. Please try again.');
      console.error('Error creating match:', err);
    }
  };

  if (loading) {
    return <div className="matching-loading">Loading matches...</div>;
  }

  if (error) {
    return <div className="matching-error">{error}</div>;
  }

  return (
    <div className="matching-system">
      <h2>Organ Matching System</h2>
      
      <div className="matching-stats">
        <div className="stat-card">
          <h3>Available Donations</h3>
          <p>{donations.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Requests</h3>
          <p>{requests.length}</p>
        </div>
        <div className="stat-card">
          <h3>Potential Matches</h3>
          <p>{matches.length}</p>
        </div>
      </div>

      <div className="matches-list">
        <h3>Potential Matches</h3>
        {matches.length === 0 ? (
          <p>No potential matches found.</p>
        ) : (
          matches.map((match, index) => (
            <div key={index} className="match-card">
              <div className="match-info">
                <h4>Organ Type: {match.organType}</h4>
                <div className="blood-type-info">
                  <p>
                    <strong>Donor Blood Type:</strong> {match.donorBloodType}
                    {match.donorBloodType === match.recipientBloodType && 
                      <span className="perfect-match"> (Perfect Match!)</span>
                    }
                  </p>
                  <p><strong>Recipient Blood Type:</strong> {match.recipientBloodType}</p>
                </div>
                <p><strong>Donor:</strong> {match.donorName}</p>
                <p><strong>Recipient:</strong> {match.recipientName}</p>
                <p className="match-score">Match Score: {match.matchScore}%</p>
              </div>
              <button 
                className="match-button"
                onClick={() => handleMatch(match)}
              >
                Create Match
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchingSystem;