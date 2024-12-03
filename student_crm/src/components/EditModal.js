import React, { useState ,useEffect} from 'react';
import { editData,fetchData } from '../services/api';

const EditModal = ({ data, columns, onClose, model,onSave  }) => {
  const [formData, setFormData] = useState(() => {
    if (data) {
        return {
          ...data,
          class: data.class || '', // Ensure 'class' is the class ID
          feesPaid: data.feesPaid || false,
          gender: data.gender || '',
        };
      } else {
        return {
          feesPaid: false,
          gender: '',
        };
      }
    });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await fetchData('classes');
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    if (columns.includes('class')) {
      fetchClasses();
    }
  }, [columns]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : 
      type === 'number' ? Number(value) :value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Create a copy of formData to manipulate if necessary
    let dataToSubmit = { ...formData };
  
    // If the 'class' key exists in dataToSubmit
    if (dataToSubmit.hasOwnProperty('class')) {
      const selectedClassName = dataToSubmit['class'];
  
      // Find the class with the matching name
      const matchingClass = classes.find((cls) => cls.name === selectedClassName);
  
      if (matchingClass) {
        // Replace the class name with the class _id
        dataToSubmit['class'] = matchingClass._id;
      } else {
        console.error('Class not found for name:', selectedClassName);
        alert('Invalid class selected.');
        return; // Exit the function if the class is invalid
      }
    }
  
    // If the model is 'teacher' and 'class' is a key in the data
    if (model === 'teacher' && dataToSubmit.hasOwnProperty('class')) {
      // Replace 'class' key with 'assignedClass'
      dataToSubmit['assignedClass'] = dataToSubmit['class'];
      delete dataToSubmit['class'];
    }
  
    if (data) {
      // Editing existing data
      const changedFields = {};
      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key] !== data[key]) {
          changedFields[key] = dataToSubmit[key];
        }
      });
      console.log('Changed Fields:', changedFields);
      try {
        await editData(changedFields, model, data._id);
      } catch (error) {
        console.error('Error editing data:', error);
        alert('Failed to edit data.');
      }
    } else {
      // Adding new data
      if (onSave) {
        onSave(dataToSubmit);
      } else {
        console.error('onSave function is not provided for adding new data.');
      }
    }
    onClose();
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/2">
      <h2 className="text-xl font-bold mb-4">{data ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit}>
          {columns.map((col) => (
            <div key={col} className="mb-4">
              <label className="block font-semibold mb-1">
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </label>
              {col === 'class' ? (
                <select
                  name={col}
                  value={formData[col] || ''}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              ) : col === 'gender' ? (
                <select
                  name={col}
                  value={formData[col]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : col === 'feesPaid' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name={col}
                    checked={formData[col] || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>{formData[col] ? 'Yes' : 'No'}</span>
                </div>
              ) : col === 'DOB' ? (
                <input
                  type="date"
                  name={col}
                  value={formData[col] ? formData[col].substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              ) : col === 'year' ? (
                <input
                  type="number"
                  name={col}
                  value={formData[col] || ''}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              ) 
               : (
                <input
                  type="text"
                  name={col}
                  value={formData[col] || ''}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
