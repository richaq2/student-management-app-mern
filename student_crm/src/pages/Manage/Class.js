import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import {fetchData ,addData } from '../../api';
import EditModal from '../../components/EditModal';
import {toast} from 'react-toastify'

const ClassList = () => {
  const [classes, setClasses] = useState([]); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

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
    setDataUpdated(false);
  }, [dataUpdated]);

  const handleAdd = async (newData) => {
    try {
      await addData('classes', newData);
      setDataUpdated(true); // Trigger re-fetching of data
      setAddModalVisible(false);
    } catch (error) {
      console.error('Error adding data:', error);
      toast.error(error.message);
    }
  };


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
      <button
        onClick={() => setAddModalVisible(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        Add Class
      </button>
      {processedClassess.length > 0 ? (
        <Table
          data={processedClassess}
          columns={['name', 'year','fees','studentLimit','existingStudents']} // Use 'class' as column since it now contains the name
          model='classes'
          setDataUpdated = {setDataUpdated}
        />
      ) : (
        <p>No class available.</p>
      )}
       {addModalVisible && (
        <EditModal
          columns={['name', 'year','fees','studentLimit']} 
          onClose={() => setAddModalVisible(false)}
          model="classes"
          onSave={handleAdd} // Pass the handleAdd function
        />
      )}
    </div>
  );
};

export default ClassList;
