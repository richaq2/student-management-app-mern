// src/pages/TeacherProfile.js

import React, { useEffect, useState } from 'react';
import { fetchData, editData } from '../api';
import { useAuth } from '../contexts/AuthContext';
import EditModal from '../components/EditModal';
import { editMe } from '../api';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    const getTeacherProfile = async () => {
      try {
        // Fetch teacher profile using the /me endpoint
        const data = await fetchData('me');
        setTeacher(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teacher profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'teacher') {
      getTeacherProfile();
    } else {
      setError('Unauthorized access.');
      setLoading(false);
    }
  }, [user, dataUpdated]);

  const handleEditSave = async (updatedData) => {
    try {
      // Only allow updating specific fields
      const fieldsToUpdate = {
        name: updatedData.name,
        gender: updatedData.gender,
        contact: updatedData.contact,
        DOB: updatedData.DOB,
      };
      await editMe(fieldsToUpdate);
      setDataUpdated((prev) => !prev);
      setEditModalVisible(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading teacher profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Teacher Profile</h1>

      {/* Personal Information */}
      <div className="bg-white shadow-md rounded-lg mb-8">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
        </div>
        <div className="p-6">
          <table className="min-w-full table-auto">
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Name</td>
                <td className="px-4 py-2">{teacher.name}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Gender</td>
                <td className="px-4 py-2">{teacher.gender}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Date of Birth</td>
                <td className="px-4 py-2">{new Date(teacher.DOB).toLocaleDateString()}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Contact</td>
                <td className="px-4 py-2">{teacher.contact}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Salary</td>
                <td className="px-4 py-2">₹{teacher.salary.toLocaleString()}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Salary Date</td>
                <td className="px-4 py-2">{new Date(teacher.salaryDate).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setEditModalVisible(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Edit Profile
        </button>
      </div>

      {/* Assigned Class */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold">Assigned Class</h2>
        </div>
        <div className="p-6">
          {teacher.assignedClass ? (
            <div>
              <table className="min-w-full table-auto mb-6">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Class Name</th>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Fees (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2">{teacher.assignedClass.name}</td>
                    <td className="px-4 py-2">{teacher.assignedClass.year}</td>
                    <td className="px-4 py-2">₹*****</td>
                  </tr>
                </tbody>
              </table>

              {/* Students */}
              <h3 className="text-xl font-semibold mb-4">Students</h3>
              {teacher.assignedClass.students.length > 0 ? (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Gender</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacher.assignedClass.students.map((student) => (
                      <tr key={student._id} className="border-t">
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.gender}</td>
                        <td className="px-4 py-2">{student.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No students assigned to this class.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No class assigned.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalVisible && (
        <EditModal
          data={{
            name: teacher.name,
            gender: teacher.gender,
            contact: teacher.contact,
            DOB: teacher.DOB ? teacher.DOB.substring(0, 10) : '',
          }}
          columns={['name', 'gender', 'contact', 'DOB']}
          onClose={() => setEditModalVisible(false)}
          onEdit={handleEditSave}
          model="teacher"
        />
      )}
    </div>
  );
};

export default TeacherProfile;
