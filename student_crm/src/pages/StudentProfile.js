import React, { useEffect, useState } from "react";
import { fetchData, editData } from "../api";
import { useAuth } from "../contexts/AuthContext";
import EditModal from "../components/EditModal";
import { editMe } from "../api";

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    const getStudentProfile = async () => {
      try {
        const data = await fetchData("me");
        setStudent(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch student profile."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "student") {
      getStudentProfile();
    } else {
      setError("Unauthorized access.");
      setLoading(false);
    }
  }, [user, dataUpdated]);

  const handleEditSave = async (updatedData) => {
    try {
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
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading student profile...</p>
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Welcome back, {user?.username}!
      </h1>

      <div className="bg-white shadow-md rounded-lg mb-8">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
        </div>
        <div className="p-6">
          <table className="min-w-full table-auto">
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Name</td>
                <td className="px-4 py-2">{student.name}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Gender</td>
                <td className="px-4 py-2">{student.gender}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Date of Birth</td>
                <td className="px-4 py-2">
                  {new Date(student.DOB).toLocaleDateString()}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Contact</td>
                <td className="px-4 py-2">{student.contact}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">Fees Paid</td>
                <td className="px-4 py-2">{student.feesPaid ? "Yes" : "No"}</td>
              </tr>
              {student.feesPaid && (
                <tr className="border-t">
                  <td className="px-4 py-2 font-semibold">Fees Paid Date</td>
                  <td className="px-4 py-2">
                    {new Date(student.feesPaidDate).toLocaleDateString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setEditModalVisible(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold">Class Details</h2>
        </div>
        <div className="p-6">
          {student.class ? (
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
                    <td className="px-4 py-2">{student.class.name}</td>
                    <td className="px-4 py-2">{student.class.year}</td>
                    <td className="px-4 py-2">
                      ₹{student.class.fees.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-xl font-semibold mb-4">
                My Teacher
                {Array.isArray(student.class.teacher) &&
                student.class.teacher.length > 1
                  ? "s"
                  : ""}
              </h3>
              {student.class.teacher && (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Gender</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(student.class.teacher) ? (
                      student.class.teacher.map((teacher) => (
                        <tr key={teacher._id} className="border-t">
                          <td className="px-4 py-2">{teacher.name}</td>
                          <td className="px-4 py-2">{teacher.gender}</td>
                          <td className="px-4 py-2">{teacher.contact}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t">
                        <td className="px-4 py-2">
                          {student.class.teacher.name}
                        </td>
                        <td className="px-4 py-2">
                          {student.class.teacher.gender}
                        </td>
                        <td className="px-4 py-2">
                          {student.class.teacher.contact}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No class assigned.</p>
          )}
        </div>
      </div>

      {editModalVisible && (
        <EditModal
          data={{
            name: student.name,
            gender: student.gender,
            contact: student.contact,
            DOB: student.DOB ? student.DOB.substring(0, 10) : "",
          }}
          columns={["name", "gender", "contact", "DOB"]}
          onClose={() => setEditModalVisible(false)}
          onEdit={handleEditSave}
          model="student"
        />
      )}
    </div>
  );
};

export default StudentProfile;
