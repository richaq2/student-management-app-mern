import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import { fetchData, addData } from "../../api";
import EditModal from "../../components/EditModal";
import { toast } from "react-toastify";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchData("student");
        setStudents(data);
      } catch (err) {
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
    setDataUpdated(false);
  }, [dataUpdated]);

  const handleAdd = async (newData) => {
    try {
      await addData("student", newData);
      setDataUpdated(true);
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error(error.message);
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const processedStudents = students.map((student) => ({
    ...student,
    class: student.class?.name || "",
    username: student.username || "",
  }));

  return (
    <div className="space-y-6 mx-5">
      <h2 className="text-2xl font-bold flex justify-center mt-4">
        Manage Students
      </h2>
      <button
        onClick={() => setAddModalVisible(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        <i class="fa fa-plus" aria-hidden="true"></i> &nbsp;Add Student
      </button>
      {processedStudents.length > 0 ? (
        <Table
          data={processedStudents}
          columns={[
            "username",
            "name",
            "feesPaid",
            "class",
            "gender",
            "DOB",
            "contact",
            "feesPaidDate",
          ]}
          model="student"
          setDataUpdated={setDataUpdated}
        />
      ) : (
        <p>No students available.</p>
      )}
      {addModalVisible && (
        <EditModal
          columns={[
            "name",
            "feesPaid",
            "class",
            "gender",
            "DOB",
            "contact",
            "feesPaidDate",
          ]}
          onClose={() => setAddModalVisible(false)}
          model="student"
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default StudentManagement;
