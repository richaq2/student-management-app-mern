import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import { fetchData, addData } from "../../api";
import EditModal from "../../components/EditModal";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import "react-loading-skeleton/dist/skeleton.css";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const loadClass = async () => {
      try {
        const data = await fetchData("classes");
        setClasses(data);
      } catch (err) {
        setError("Failed to load class");
      } finally {
        setLoading(false);
      }
    };
    loadClass();
    setDataUpdated(false);
  }, [dataUpdated]);

  const handleAdd = async (newData) => {
    try {
      await addData("classes", newData);
      setDataUpdated(true);
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error(error.message);
    }
  };

  const processedClasses = classes.map((classe) => ({
    ...classe,
    student: classe.students[0]?.name || "",
    teacher: classe.teacher?.name || "",
  }));

  return (
    <div className="space-y-6 mx-5">
      <h2 className="text-2xl font-bold flex justify-center mt-4">
        Manage Class
      </h2>
      <button
        onClick={() => setAddModalVisible(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        <i className="fa fa-plus" aria-hidden="true"></i> &nbsp; Add Class
      </button>

      {/* Skeleton Loader */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-white shadow rounded">
              <Skeleton height={20} width={200} />
              <Skeleton height={20} width={100} />
              <Skeleton height={20} width={80} />
              <Skeleton height={20} width={120} />
              <Skeleton height={20} width={100} />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : processedClasses.length > 0 ? (
        <Table
          data={processedClasses}
          columns={["name", "year", "fees", "studentLimit", "existingStudents"]}
          model="classes"
          setDataUpdated={setDataUpdated}
        />
      ) : (
        <p>No class available.</p>
      )}

      {addModalVisible && (
        <EditModal
          columns={["name", "year", "fees", "studentLimit"]}
          onClose={() => setAddModalVisible(false)}
          model="classes"
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default ClassList;
