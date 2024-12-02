import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/profile/teacher/${user.id}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold">Teacher Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Subjects:</strong> {profile.subjects}</p>
      <p><strong>Salary:</strong> ${profile.salary}</p>
      <p><strong>Assigned Classes:</strong></p>
      <ul>
        {profile.assignedClasses.map((cls) => (
          <li key={cls._id}>{cls.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherProfile;
