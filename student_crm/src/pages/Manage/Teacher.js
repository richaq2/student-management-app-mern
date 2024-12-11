import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import { fetchData, addData } from "../../api";
import EditModal from "../../components/EditModal";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchData("teacher");
        setTeachers(data);
      } catch (err) {
        setError("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
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

  const processedTeachers = teachers.map((teacher) => ({
    ...teacher,
    class: teacher.assignedClass?.name || "",
    students: teacher.assignedClass?.students[0]?.name,
  }));

  return (
    <div className="space-y-6 mx-5">
      <h2 className="text-2xl font-bold flex justify-center mt-4">
        Manage Teachers
      </h2>
      <button
        onClick={() => setAddModalVisible(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4 ml-4"
      >
        <i className="fa fa-plus" aria-hidden="true"></i> &nbsp;Add Teacher
      </button>


      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-4 bg-white shadow rounded"
            >
              <Skeleton height={20} width={100} />
              <Skeleton height={20} width={120} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={100} />
              <Skeleton height={20} width={120} />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : processedTeachers.length > 0 ? (
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
