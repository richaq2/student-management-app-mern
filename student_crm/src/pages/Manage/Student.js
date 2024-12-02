import React, { useState, useEffect } from 'react';
import Table from '../../components/Table';
import { fetchData } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchData('student');
        setStudents(data);
      } catch (err) {
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const processedStudents = students.map((student) => ({
    ...student,
    class: student.class?.name || '', // Replace 'class' object with its 'name' property
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Students</h2>
      {processedStudents.length > 0 ? (
        <Table
          data={processedStudents}
          columns={['name', 'feesPaid', 'class']} // Use 'class' as column since it now contains the name
        />
      ) : (
        <p>No students available.</p>
      )}
    </div>
  );
};

export default StudentManagement;
