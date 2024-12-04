// src/components/EditModal.js

import React, { useState, useEffect } from 'react';
import { editData, fetchData } from '../api';
import { toast } from 'react-toastify';

const EditModal = ({ data, columns, onClose, model, onSave, onEdit }) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    if (data) {
      columns.forEach((col) => {
        if (col === 'feesPaid') {
          initialData[col] = data[col] || false;
        } else {
          initialData[col] = data[col] || '';
        }
      });
    } else {
      columns.forEach((col) => {
        if (col === 'feesPaid') {
          initialData[col] = false;
        } else {
          initialData[col] = '';
        }
      });
    }
    return initialData;
  });
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState({});

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

    // Special handling for feesPaid checkbox
    if (type === 'checkbox' && name === 'feesPaid') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
        feesPaidDate: checked ? prevData.feesPaidDate : '',
      }));
      // Clear errors related to feesPaidDate
      setErrors((prevErrors) => ({
        ...prevErrors,
        feesPaidDate: '',
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      }));
    }
    // Clear error for this field when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};

    columns.forEach((col) => {
      const value = formData[col];

      // Required fields
      if (
        ['name', 'gender', 'contact', 'DOB', 'year', 'fees', 'salary', 'salaryDate', 'class'].includes(col) &&
        (value === '' || value === null || value === undefined)
      ) {
        newErrors[col] = `${col.charAt(0).toUpperCase() + col.slice(1)} is required.`;
      }

      // Fees Paid Date validation
      if (col === 'feesPaidDate' && formData['feesPaid']) {
        if (!value || value === '') {
          newErrors[col] = 'Fees Paid Date is required when Fees Paid is checked.';
        } else {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            newErrors[col] = 'Invalid date.';
          } else if (dateValue > new Date()) {
            newErrors[col] = 'Date cannot be in the future.';
          }
        }
      }

      // Specific validations
      if (col === 'contact' && value) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value)) {
          newErrors[col] = 'Contact must be a 10-digit number.';
        }
      }
      if (col === 'gender' && value) {
        if (!['Male', 'Female'].includes(value)) {
          newErrors[col] = 'Gender must be either Male or Female.';
        }
      }
      if ((col === 'DOB' || col === 'salaryDate') && value) {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          newErrors[col] = 'Invalid date.';
        } else if (dateValue > new Date()) {
          newErrors[col] = 'Date cannot be in the future.';
        }
      }
      if (col === 'year' && value) {
        if (!Number.isInteger(value) || value < 1900 || value > new Date().getFullYear() + 10) {
          newErrors[col] = 'Year must be a valid year.';
        }
      }
      if ((col === 'fees' || col === 'salary') && value !== undefined) {
        if (isNaN(value) || value < 0) {
          newErrors[col] = `${col.charAt(0).toUpperCase() + col.slice(1)} must be a positive number.`;
        }
      }
      if (col === 'class' && columns.includes('class') && value) {
        const selectedClassName = value;
        const matchingClass = classes.find((cls) => cls.name === selectedClassName);
        if (!matchingClass) {
          newErrors[col] = 'Invalid class selected.';
        }
      }
    });

    // If there are errors, set errors state and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Set feesPaidDate to empty if feesPaid is false
    if (!formData['feesPaid']) {
      formData['feesPaidDate'] = '';
    }

    // Create a copy of formData to manipulate if necessary
    let dataToSubmit = { ...formData };

    // If the 'class' key exists and is part of the columns
    if (columns.includes('class') && dataToSubmit.hasOwnProperty('class')) {
      const selectedClassName = dataToSubmit['class'];

      // Find the class with the matching name
      const matchingClass = classes.find((cls) => cls.name === selectedClassName);

      if (matchingClass) {
        // Replace the class name with the class _id
        dataToSubmit['class'] = matchingClass._id;
      } else {
        console.error('Class not found for name:', selectedClassName);
        toast.error('Invalid class selected.');
        return; // Exit the function if the class is invalid
      }
    }

    // If the model is 'teacher' and 'class' is a key in the data
    if (model === 'teacher' && columns.includes('class') && dataToSubmit.hasOwnProperty('class')) {
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
      try {
        if (onEdit) {
          await onEdit(changedFields);
        } else {
          await editData(model, data._id, changedFields);
        }
        if (onSave) {
          onSave();
        }
      } catch (error) {
        console.error('Error editing data:', error);
        toast.error(error.message);
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
        <h2 className="text-xl font-bold mb-4">
          {data ? 'Edit Profile' : 'Add Profile'}
        </h2>
        <form onSubmit={handleSubmit}>
          {columns
            .filter((col) => !(model === 'classes' && col === 'existingStudents'))
            .filter((col) => !(col === 'feesPaidDate' && !formData['feesPaid']))
            .map((col) => (
              <div key={col} className="mb-4">
                <label className="block font-semibold mb-1">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </label>
                {col === 'class' ? (
                  <>
                    <select
                      name={col}
                      value={formData[col] || ''}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : col === 'gender' ? (
                  <>
                    <select
                      name={col}
                      value={formData[col]}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : col === 'feesPaid' ? (
                  <>
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
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : col === 'feesPaidDate' ? (
                  <>
                    <input
                      type="date"
                      name={col}
                      value={formData[col] ? formData[col].substring(0, 10) : ''}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    />
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : col === 'DOB' || col === 'salaryDate' ? (
                  <>
                    <input
                      type="date"
                      name={col}
                      value={formData[col] ? formData[col].substring(0, 10) : ''}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    />
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : col === 'year' || col === 'fees' || col === 'salary' || col === 'studentLimit' ? (
                  <>
                    <input
                      type="number"
                      name={col}
                      value={formData[col] || ''}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    />
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
                ) : (
                  <>
                    <input
                      type={col === 'contact' ? 'tel' : 'text'}
                      name={col}
                      value={formData[col] || ''}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${errors[col] ? 'border-red-500' : ''}`}
                    />
                    {errors[col] && <p className="text-red-500 text-sm mt-1">{errors[col]}</p>}
                  </>
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
