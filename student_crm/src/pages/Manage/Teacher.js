import React, { useState, useEffect } from 'react';
import Table from '../../components/Table';
import { fetchData } from '../../services/api';

const TeacherManagement = () => {
  const [teachers, setteachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadteachers = async () => {
      try {
        const data = await fetchData('teacher');
        setteachers(data);
      } catch (err) {
        setError('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };
    loadteachers();
  }, []);

  if (loading) return <p>Loading teachers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const processedTeachers= teachers.map((teacher) => ({
    ...teacher,
    assignedClass: teacher.assignedClass?.name || '', // Replace 'class' object with its 'name' property
    students:teacher.assignedClass?.students[0]?.name
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage teachers</h2>
      {processedTeachers.length > 0 ? (
        <Table
          data={processedTeachers}
          columns={['name', 'salary','gender', 'assignedClass','contact','students']} // Use 'class' as column since it now contains the name
        />
      ) : (
        <p>No teachers available.</p>
      )}
    </div>
  );
};

export default TeacherManagement;
