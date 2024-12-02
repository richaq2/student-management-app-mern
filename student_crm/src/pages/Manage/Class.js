import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import { fetchData } from '../../services/api';

const ClassList = () => {
  const [classes, setClasses] = useState([]); // Initialize as an empty array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClass = async () => {
      try {
        const data = await fetchData('classes');
        setClasses(data);
      } catch (err) {
        setError('Failed to load class');
      } finally {
        setLoading(false);
      }
    };
    loadClass();
  }, []);

  if (loading) return <p>Loading class...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const processedClassess = classes.map((classe) => ({
    ...classe,
    student: classe.students[0]?.name || '',
    teacher: classe.teacher?.name || '',
  }));
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Class</h2>
      {processedClassess.length > 0 ? (
        <Table
          data={processedClassess}
          columns={['name', 'year', 'teacher', 'student']} // Use 'class' as column since it now contains the name
        />
      ) : (
        <p>No class available.</p>
      )}
    </div>
  );
};

export default ClassList;
