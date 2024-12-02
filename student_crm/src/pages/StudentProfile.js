import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../services/api';

const StudentProfile = () => {
  const { id } = useParams(); // Get student ID from URL
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student profile
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/profile/student/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Student Profile</h2>
      {profile ? (
        <div className="space-y-4">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Gender:</strong> {profile.gender}
          </p>
          <p>
            <strong>Date of Birth:</strong> {new Date(profile.DOB).toLocaleDateString()}
          </p>
          <p>
            <strong>Contact:</strong> {profile.contact}
          </p>
          <p>
            <strong>Fees Paid:</strong> {profile.feesPaid ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Class:</strong> {profile.class ? profile.class.name : 'Not Assigned'}
          </p>
        </div>
      ) : (
        <p>No profile data available</p>
      )}
    </div>
  );
};

export default StudentProfile;
