import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import { fetchData, addData } from "../../api";
import EditModal from "../../components/EditModal";
import { toast } from "react-toastify";

const TeacherManagement = () => {
  const [teachers, setteachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const loadteachers = async () => {
      try {
        const data = await fetchData("teacher");
        setteachers(data);
      } catch (err) {
        setError("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };
    loadteachers();
    setDataUpdated(false);
  }, [dataUpdated]);

  const handleAdd = async (newData) => {
    try {
      await addData("teacher", newData);
      setDataUpdated(true);
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error(error.message);
    }
  };

  if (loading) return <p>Loading teachers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const processedTeachers = teachers.map((teacher) => ({
    ...teacher,
    class: teacher.assignedClass?.name || "",
    students: teacher.assignedClass?.students[0]?.name,
  }));

  return (
    <div className="space-y-6  mx-5">
      <h2 className="text-2xl font-bold flex justify-center mt-4">
        Manage teachers
      </h2>
      <button
        onClick={() => setAddModalVisible(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4 ml-4"
      >
        <i class="fa fa-plus" aria-hidden="true"></i> &nbsp;Add Teacher
      </button>
      {processedTeachers.length > 0 ? (
        <Table
          data={processedTeachers}
          columns={[
            "username",
            "name",
            "salary",
            "gender",
            "DOB",
            "class",
            "contact",
            "salaryDate",
          ]}
          model="teacher"
          setDataUpdated={setDataUpdated}
        />
      ) : (
        <p>No teachers available.</p>
      )}
      {addModalVisible && (
        <EditModal
          columns={[
            "name",
            "salary",
            "gender",
            "DOB",
            "class",
            "contact",
            "salaryDate",
          ]}
          onClose={() => setAddModalVisible(false)}
          model="teacher"
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default TeacherManagement;
