import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchData } from '../api';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClassAnalytics = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const getClassData = async () => {
      try {
        const data = await fetchData(`classes/${id}`);
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
        setError('Failed to load class data.');
      } finally {
        setLoading(false);
      }
    };

    getClassData();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        <p className="ml-4 text-gray-700">Loading class data...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!classData)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">Class not found.</p>
      </div>
    );

  const maleCount = classData.students.filter(
    (student) => student.gender === 'Male'
  ).length;
  const femaleCount = classData.students.filter(
    (student) => student.gender === 'Female'
  ).length;

  const chartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Number of Students',
        data: [maleCount, femaleCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gender Distribution' },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {classData.name} - {classData.year}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <i className="fa fa-user mr-2"></i> Teacher
            </h3>
            {classData.teacher.length > 0 ? (
              <ul className="space-y-2">
                {classData.teacher.map((teacher) => (
                  <li key={teacher._id} className="flex items-center">
                    <i className="fa fa-user mr-2 text-blue-500"></i>
                    {teacher.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No teacher assigned.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <i className="fa fa-graduation-cap mr-2"></i> Students
            </h3>
            {classData.students.length > 0 ? (
              <div className="overflow-y-auto max-h-64">
                <ul className="divide-y divide-gray-200">
                  {classData.students.map((student) => (
                    <li key={student._id} className="py-2 flex items-center">
                      <i className="fa fa-user mr-2 text-green-500"></i>
                      <span className="font-medium">{student.name}</span>
                      <span className="ml-auto text-gray-600">
                        ({student.gender})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-600">No students enrolled.</p>
            )}
          </div>
        </div>

        {/* Gender Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <i className="fa fa-bar-chart mr-2"></i> Gender Distribution
          </h3>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;
